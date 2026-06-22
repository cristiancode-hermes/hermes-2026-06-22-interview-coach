import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInterviewDto {
  @ApiPropertyOptional({ enum: ['frontend', 'backend', 'fullstack', 'data', 'devops'] })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ enum: ['junior', 'mid', 'senior', 'staff'] })
  @IsOptional()
  @IsString()
  seniority?: string;

  @ApiPropertyOptional({ enum: ['technical', 'behavioral', 'mixed'] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  technologies?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetCompany?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  adaptiveMode?: boolean;

  @ApiPropertyOptional({ enum: ['draft', 'in_progress', 'completed', 'cancelled'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalQuestions?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  avgScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  duration?: number;
}
