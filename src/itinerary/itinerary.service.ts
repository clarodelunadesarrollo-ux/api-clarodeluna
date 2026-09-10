import type { ItineraryResponse } from '@claro-de-luna/shared';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ITINERARY_TEMPLATE } from './itinerary.template';

@Injectable()
export class ItineraryService {
  constructor(private readonly prisma: PrismaService) {}

  async getForUser(userId: string): Promise<ItineraryResponse> {
    const reservation = await this.prisma.reservation.findFirst({
      where: { userId },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
    if (!reservation) {
      return { reservationId: null, milestones: [] };
    }

    let milestones = await this.prisma.itineraryMilestone.findMany({
      where: { reservationId: reservation.id },
      orderBy: { order: 'asc' },
    });

    // Seed the standard itinerary the first time it is requested.
    if (milestones.length === 0) {
      await this.prisma.itineraryMilestone.createMany({
        data: ITINERARY_TEMPLATE.map((milestone) => ({
          ...milestone,
          reservationId: reservation.id,
        })),
      });
      milestones = await this.prisma.itineraryMilestone.findMany({
        where: { reservationId: reservation.id },
        orderBy: { order: 'asc' },
      });
    }

    return {
      reservationId: reservation.id,
      milestones: milestones.map((milestone) => ({
        id: milestone.id,
        order: milestone.order,
        time: milestone.time,
        name: milestone.name,
        description: milestone.description,
        x: milestone.x,
        y: milestone.y,
      })),
    };
  }
}
