import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Questions')
@Controller('api/questions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a single question by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.findOne(id);
  }

  @Get('interviews/:interviewId/questions')
  @ApiOperation({ summary: 'Get all questions for an interview' })
  findByInterview(@Param('interviewId', ParseIntPipe) interviewId: number) {
    return this.questionsService.findByInterview(interviewId);
  }

  @Post('interviews/:interviewId/questions/generate')
  @ApiOperation({ summary: 'Generate questions for an interview using AI presets' })
  generate(@Param('interviewId', ParseIntPipe) interviewId: number) {
    return this.questionsService.generate(interviewId);
  }

  @Post('interviews/:interviewId/questions/batch')
  @ApiOperation({ summary: 'Batch create questions for an interview' })
  batchCreate(
    @Param('interviewId', ParseIntPipe) interviewId: number,
    @Body() dtos: CreateQuestionDto[],
  ) {
    return this.questionsService.batchCreate(interviewId, dtos);
  }
}
