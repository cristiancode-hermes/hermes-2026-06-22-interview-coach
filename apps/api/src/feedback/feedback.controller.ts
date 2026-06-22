import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Feedback')
@Controller('api/feedback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get('answers/:answerId/feedback')
  @ApiOperation({ summary: 'Get feedback for a specific answer' })
  getByAnswerId(@Param('answerId', ParseIntPipe) answerId: number) {
    return this.feedbackService.getByAnswerId(answerId);
  }

  @Post('answers/:answerId/feedback/regenerate')
  @ApiOperation({ summary: 'Regenerate feedback for a specific answer' })
  regenerate(@Param('answerId', ParseIntPipe) answerId: number) {
    return this.feedbackService.regenerate(answerId);
  }
}
