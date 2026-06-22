import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Interviews')
@Controller('api/interviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new interview session' })
  create(
    @CurrentUser() userId: number,
    @Body() dto: CreateInterviewDto,
  ) {
    return this.interviewsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List interview sessions with pagination and filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'type', required: false })
  findAll(
    @CurrentUser() userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
    @Query('type') type?: string,
  ) {
    return this.interviewsService.findAll(userId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      role,
      type,
    });
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent interview sessions' })
  findRecent(@CurrentUser() userId: number) {
    return this.interviewsService.findRecent(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interview by ID' })
  findOne(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.interviewsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update interview session' })
  update(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInterviewDto,
  ) {
    return this.interviewsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete interview session' })
  remove(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.interviewsService.remove(id, userId);
  }
}
