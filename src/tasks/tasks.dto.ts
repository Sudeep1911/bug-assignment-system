import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsDate,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  taskId?: string;

  @IsString()
  @ApiProperty()
  projectId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  companyId?: string;

  @IsOptional()
  @IsEnum(['Bug', 'Feature', 'Task'])
  @ApiProperty({ enum: ['Bug', 'Feature', 'Task'], required: false })
  type?: 'Bug' | 'Feature' | 'Task';

  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  raisedBy: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  monitoredBy?: string;

  @IsString()
  @ApiProperty()
  modules: string;

  @IsOptional()
  @IsEnum(['High', 'Medium', 'Low'])
  @ApiProperty({ enum: ['High', 'Medium', 'Low'], required: false })
  priority?: 'High' | 'Medium' | 'Low';

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  assignedTo?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  tags?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiProperty({ required: false })
  dueDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false })
  attachments?: File[];
}
