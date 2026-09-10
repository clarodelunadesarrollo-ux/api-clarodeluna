import {
    checkinSchema,
    type CheckinDto,
    type CheckinResponse,
    type CheckinStatusResponse,
    type EntranceCodeResponse,
} from '@claro-de-luna/shared';
import { Body, Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard, type AuthUser } from '../common/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CheckinService } from './checkin.service';

@Controller('checkin')
@UseGuards(JwtAuthGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  checkin(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(checkinSchema)) body: CheckinDto,
  ): Promise<CheckinResponse> {
    return this.checkinService.checkin(user.id, body);
  }

  @Get('status')
  status(@CurrentUser() user: AuthUser): Promise<CheckinStatusResponse> {
    return this.checkinService.getStatus(user.id);
  }

  @Get('entrance-code')
  entranceCode(@CurrentUser() user: AuthUser): Promise<EntranceCodeResponse> {
    if (user.role !== 'qa' && user.role !== 'admin') {
      throw new ForbiddenException('Solo el equipo QA puede ver el código de entrada.');
    }
    return this.checkinService.getEntranceCode();
  }

  @Post('entrance-code/rotate')
  rotateEntranceCode(@CurrentUser() user: AuthUser): Promise<EntranceCodeResponse> {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Solo el admin puede cambiar el código de entrada.');
    }
    return this.checkinService.regenerateEntranceCode();
  }
}
