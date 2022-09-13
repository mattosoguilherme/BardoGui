import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class MonthReportDto {
  @IsString({
    message: 'O campo monthToSearch deve ser obrigatoriamente uma string ',
  })
  @IsNotEmpty({
    message: 'Campo monthToSearch é obrigatório',
  })
  @ApiProperty({
    description:
      'Data de busca para gerar relatório referente ao fluxo mensal',
  })
  @Length(2, 2, {
    message: 'O campo monthToSearch deve conter apenas dois caracteres. EX: 09',
  })
  monthToSearch: string;
}
