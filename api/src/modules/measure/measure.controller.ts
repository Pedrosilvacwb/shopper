import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { MeasureService } from './measure.service';
import { CreateMeasureDto } from './dto/createMeasure.dto';
import { ConfirmMeasureDto } from './dto/confirmMeasure.dto';

@Controller('')
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  @Post('/upload')
  create(@Body() createMeasureDto: CreateMeasureDto) {
    return this.measureService.create(createMeasureDto);
  }

  @Patch('/confirm')
  update(@Body() confirmMeasure: ConfirmMeasureDto) {
    return this.measureService.confirmMeasure(confirmMeasure);
  }

  @Get(':customerCode/list')
  findAll(
    @Param('customerCode') customerCode: string,
    @Query('measure_type') measure_type?: string,
  ) {
    return this.measureService.findAll(customerCode, measure_type);
  }
}
