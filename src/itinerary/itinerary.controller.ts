import type { ItineraryResponse } from '@claro-de-luna/shared';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard, type AuthUser } from '../common/jwt-auth.guard';
import { ItineraryService } from './itinerary.service';

@Controller('itinerary')
@UseGuards(JwtAuthGuard)
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Get()
  getMine(@CurrentUser() user: AuthUser): Promise<ItineraryResponse> {
    return this.itineraryService.getForUser(user.id);
  }
}
