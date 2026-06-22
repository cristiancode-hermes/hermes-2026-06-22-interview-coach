import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: ['algorithms', 'system_design', 'frontend', 'backend', 'data', 'behavioral', 'general'] })
  @IsString()
  category: string;

  @ApiPropertyOptional({ enum: ['easy', 'medium', 'hard'], default: 'medium' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  orderIndex: number;

  @ApiPropertyOptional({ default: 180 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  timeLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyPoints?: string;
}
