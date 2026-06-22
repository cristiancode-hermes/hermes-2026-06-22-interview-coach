import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInterviewDto {
  @ApiProperty({ enum: ['frontend', 'backend', 'fullstack', 'data', 'devops'] })
  @IsString()
  role: string;

  @ApiProperty({ enum: ['junior', 'mid', 'senior', 'staff'] })
  @IsString()
  seniority: string;

  @ApiProperty({ enum: ['technical', 'behavioral', 'mixed'] })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'React, Node.js, TypeScript' })
  @IsOptional()
  @IsString()
  technologies?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetCompany?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  adaptiveMode?: boolean;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  totalQuestions?: number;
}
