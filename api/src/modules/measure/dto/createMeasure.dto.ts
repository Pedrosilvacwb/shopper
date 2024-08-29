import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBase64,
  IsDateString,
} from 'class-validator';

enum MeasureTypes {
  WATER = 'WATER',
  GAS = 'GAS',
}
export class CreateMeasureDto {
  @IsNotEmpty()
  @IsBase64()
  image: string;

  @IsString()
  @IsNotEmpty()
  customer_code: string;

  @IsDateString()
  measure_datetime: Date;

  @IsNotEmpty()
  @IsEnum(MeasureTypes)
  measure_type: string;
}
