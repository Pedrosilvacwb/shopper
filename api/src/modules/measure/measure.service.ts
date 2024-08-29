import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMeasureDto } from './dto/createMeasure.dto';
import { MeasureRepository } from './measure.repository';

import { MeasureType } from '@prisma/client';

import { MeasureUtils } from './measure.utils';
import { ConfirmMeasureDto } from './dto/confirmMeasure.dto';

@Injectable()
export class MeasureService {
  constructor(
    private readonly measureRepo: MeasureRepository,
    private readonly measureUtils: MeasureUtils,
  ) {}
  async create({
    customer_code,
    image,
    measure_datetime,
    measure_type,
  }: CreateMeasureDto) {
    const normalizedMeasureType =
      this.measureUtils.normalizeMeasureType(measure_type);

    await this.measureUtils.checkMeasureExists(
      customer_code,
      normalizedMeasureType,
      new Date(measure_datetime),
    );

    const [filePath, fileName] = await this.measureUtils.savePictureFile(image);

    const value = await this.measureUtils.uploadPictureAndGetValue(filePath);

    const newMeasure = await this.measureRepo.create({
      data: {
        customer_code,
        file_name: fileName,
        measure_type:
          measure_type === 'GAS' ? MeasureType.GAS : MeasureType.WATER,
        value: +value,
        measured_at: new Date(measure_datetime),
      },
    });

    return {
      image_url: this.measureUtils.buildImageUrl(fileName),
      measure_value: value,
      measure_uuid: newMeasure.id,
    };
  }

  async confirmMeasure({ confirmed_value, measure_uuid }: ConfirmMeasureDto) {
    const measure = await this.measureRepo.findFirst({
      where: { id: measure_uuid },
    });

    if (!measure) {
      throw new NotFoundException({
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Leitura do mês não encontrada',
      });
    }

    if (measure.is_confirmed) {
      throw new ConflictException({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'Leitura do mês já realizada',
      });
    }

    await this.measureRepo.update({
      data: {
        value:
          measure.value !== confirmed_value ? confirmed_value : measure.value,
        is_confirmed: true,
      },
      where: { id: measure_uuid },
    });

    return {
      success: true,
    };
  }

  async findAll(customerCode: string, measure_type?: string) {
    const normalizedMeasureType =
      this.measureUtils.normalizeMeasureType(measure_type);

    const filters = this.measureUtils.buildFilters(
      customerCode,
      normalizedMeasureType,
    );

    const measures = await this.measureRepo.findMany({
      where: filters,
    });

    if (!measures.length) {
      throw new NotFoundException({
        error_code: 'MEASURES_NOT_FOUND',
        error_description: 'Nenhuma leitura encontrada',
      });
    }

    return {
      customer_code: customerCode,
      measures: measures.map((measure) => ({
        measure_uuid: measure.id,
        measure_datetime: measure.measured_at,
        measure_type: measure.measure_type,
        has_confirmed: measure.is_confirmed,
        image_url: this.measureUtils.buildImageUrl(measure.file_name),
      })),
    };
  }
}
