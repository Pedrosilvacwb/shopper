import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { PrismaService } from '../../connectors/prisma.service';

@Injectable()
export class MeasureRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findMany(findManyDto: Prisma.MeasureFindManyArgs) {
    return this.prismaService.measure.findMany(findManyDto);
  }

  findFirst(findFirstDto: Prisma.MeasureFindFirstArgs) {
    return this.prismaService.measure.findFirst(findFirstDto);
  }

  create(createDto: Prisma.MeasureCreateArgs) {
    return this.prismaService.measure.create(createDto);
  }

  update(updateDto: Prisma.MeasureUpdateArgs) {
    return this.prismaService.measure.update(updateDto);
  }
}
