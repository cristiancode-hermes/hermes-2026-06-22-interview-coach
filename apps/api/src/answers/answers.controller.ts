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
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Answers')
@Controller('api/answers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post('interviews/:interviewId/answers')
  @ApiOperation({ summary: 'Submit an answer for a question in an interview' })
  create(
    @CurrentUser() userId: number,
    @Param('interviewId', ParseIntPipe) interviewId: number,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.answersService.create(userId, interviewId, dto);
  }

  @Get('interviews/:interviewId/answers')
  @ApiOperation({ summary: 'Get all answers for an interview' })
  findByInterview(@Param('interviewId', ParseIntPipe) interviewId: number) {
    return this.answersService.findByInterview(interviewId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single answer by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.answersService.findOne(id);
  }
}
