import { IsNotEmpty, IsString } from 'class-validator';

export class PayBillDto {
  @IsNotEmpty()
  @IsString()
  method: string;
}
