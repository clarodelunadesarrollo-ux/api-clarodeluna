import {
    createReservationSchema,
    updateReservationSchema,
    type CreateReservationDto,
    type Reservation,
    type UpdateReservationDto,
} from '@claro-de-luna/shared';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard, type AuthUser } from '../common/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('me')
  findMine(@CurrentUser() user: AuthUser): Promise<Reservation[]> {
    return this.reservationsService.findForUser(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createReservationSchema)) body: CreateReservationDto,
  ): Promise<Reservation> {
    return this.reservationsService.create(user.id, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateReservationSchema)) body: UpdateReservationDto,
  ): Promise<Reservation> {
    return this.reservationsService.update(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    return this.reservationsService.remove(user.id, id);
  }
}
