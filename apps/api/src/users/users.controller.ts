import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/stats')
  @ApiOperation({ summary: 'Get user stats (interview count, answers, avg score)' })
  getStats(@CurrentUser() userId: number) {
    return this.usersService.getStats(userId);
  }

  @Get('me/weaknesses')
  @ApiOperation({ summary: 'Get per-category weaknesses' })
  getWeaknesses(@CurrentUser() userId: number) {
    return this.usersService.getWeaknesses(userId);
  }
}
