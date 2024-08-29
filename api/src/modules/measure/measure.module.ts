import { Module } from '@nestjs/common';
import { MeasureService } from './measure.service';
import { MeasureController } from './measure.controller';
import { MeasureRepository } from './measure.repository';
import { PrismaService } from '../../connectors/prisma.service';
import { MeasureUtils } from './measure.utils';

@Module({
  controllers: [MeasureController],
  providers: [MeasureService, PrismaService, MeasureRepository, MeasureUtils],
})
export class MeasureModule {}
