import {
    MAX_ACTIVE_RESERVATIONS,
    restaurantDateISO,
    type CreateReservationDto,
    type Reservation,
    type UpdateReservationDto,
} from '@claro-de-luna/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Reservation as PrismaReservation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const ACTIVE_STATUSES = ['pending', 'confirmed'] as const;

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string): Promise<Reservation[]> {
    await this.purgePastReservations(userId);
    const reservations = await this.prisma.reservation.findMany({
      where: { userId },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
    return reservations.map((reservation) => this.toDto(reservation));
  }

  async create(userId: string, dto: CreateReservationDto): Promise<Reservation> {
    await this.purgePastReservations(userId);
    const activeCount = await this.prisma.reservation.count({
      where: { userId, status: { in: [...ACTIVE_STATUSES] } },
    });
    if (activeCount >= MAX_ACTIVE_RESERVATIONS) {
      throw new BadRequestException(
        `Ya tenés ${MAX_ACTIVE_RESERVATIONS} reservas activas. Editá o eliminá una para crear otra.`,
      );
    }
    const reservation = await this.prisma.reservation.create({
      data: {
        userId,
        date: new Date(`${dto.date}T00:00:00.000Z`),
        time: dto.time,
        partySize: dto.partySize,
      },
    });
    return this.toDto(reservation);
  }

  async update(userId: string, id: string, dto: UpdateReservationDto): Promise<Reservation> {
    const existing = await this.findOwnedPending(userId, id);
    const reservation = await this.prisma.reservation.update({
      where: { id: existing.id },
      data: {
        date: new Date(`${dto.date}T00:00:00.000Z`),
        time: dto.time,
        partySize: dto.partySize,
      },
    });
    return this.toDto(reservation);
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.findOwnedPending(userId, id);
    await this.prisma.reservation.delete({ where: { id: existing.id } });
  }

  // Loads a reservation owned by the user that is still editable (pending).
  private async findOwnedPending(userId: string, id: string): Promise<PrismaReservation> {
    const reservation = await this.prisma.reservation.findFirst({ where: { id, userId } });
    if (!reservation) {
      throw new NotFoundException('No encontramos esa reserva a tu nombre.');
    }
    if (reservation.status !== 'pending') {
      throw new BadRequestException('Solo podés editar o eliminar una reserva no confirmada.');
    }
    return reservation;
  }

  // Auto-removes the user's past reservations that stayed pending or confirmed;
  // their day is over, so they free the active limit. CheckIn/milestones cascade.
  private async purgePastReservations(userId: string): Promise<void> {
    const startOfToday = new Date(`${restaurantDateISO()}T00:00:00.000Z`);
    await this.prisma.reservation.deleteMany({
      where: {
        userId,
        status: { in: [...ACTIVE_STATUSES] },
        date: { lt: startOfToday },
      },
    });
  }

  private toDto(reservation: PrismaReservation): Reservation {
    return {
      id: reservation.id,
      date: reservation.date.toISOString().slice(0, 10),
      time: reservation.time,
      partySize: reservation.partySize,
      status: reservation.status,
    };
  }
}
