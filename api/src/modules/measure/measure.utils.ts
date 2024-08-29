import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { MeasureRepository } from './measure.repository';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { MeasureType } from '@prisma/client';
import { fileManager, genAI } from '../../connectors/google.service';

@Injectable()
export class MeasureUtils {
  constructor(private readonly measureRepo: MeasureRepository) {}

  async savePictureFile(image: string) {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const currentDir = '/api/src/';

    const uploadDir = path.join(currentDir, 'images');
    const fileName = `${Date.now()}-image.jpg`;
    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    fs.writeFileSync(filePath, buffer);

    return [filePath, fileName];
  }

  async checkMeasureExists(
    customer_code: string,
    measure_type: MeasureType,
    measure_datetime: Date,
  ) {
    const startOfMonth = new Date(
      measure_datetime.getFullYear(),
      measure_datetime.getMonth(),
      1,
    );

    const endOfMonth = new Date(
      measure_datetime.getFullYear(),
      measure_datetime.getMonth() + 1,
      1,
    );

    const existingMeasure = await this.measureRepo.findFirst({
      where: {
        customer_code: { equals: customer_code },
        measure_type: { equals: measure_type },
        measured_at: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    });

    if (!!existingMeasure) {
      throw new ConflictException({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada',
      });
    }
  }

  async uploadPictureAndGetValue(filePath: string) {
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: 'image/jpeg',
      displayName: 'Measure Invoice',
    });

    const value = await this.extractValueFromImage(uploadResponse.file.uri);

    if (value === null) {
      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description:
          'Unable to extract value from the image. Please try another image.',
      });
    }

    return value;
  }

  private async extractValueFromImage(fileUri: string): Promise<number | null> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: 'image/jpeg',
          fileUri,
        },
      },
      {
        text: 'Extract the value from this invoice. Format: value:value_of_the_invoice',
      },
    ]);

    const valueText = result.response.text();
    const regex = /value:(\d+[.,]\d+)/;
    const match = valueText.match(regex);

    return match ? parseFloat(match[1].replace(',', '.')) : null;
  }

  buildFilters(customerCode: string, measureType?: MeasureType) {
    const filters = {
      customer_code: customerCode,
    };

    if (measureType) {
      filters['measure_type'] = measureType;
    }

    return filters;
  }

  normalizeMeasureType(measureType?: string): MeasureType | undefined {
    if (!measureType) return undefined;

    const upperCaseType = measureType.toUpperCase();
    if (
      upperCaseType !== MeasureType.GAS &&
      upperCaseType !== MeasureType.WATER
    ) {
      throw new BadRequestException({
        error_code: 'INVALID_TYPE',
        error_description: 'Invalid measurement type',
      });
    }
    return upperCaseType;
  }

  buildImageUrl(fileName: string) {
    return `http://localhost:3000/images/${fileName}`;
  }
}
