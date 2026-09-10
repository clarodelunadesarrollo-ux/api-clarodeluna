import type {
    CheckinDto,
    CheckinResponse,
    CheckinStatusResponse,
    EntranceCodeResponse,
} from '@claro-de-luna/shared';
import { restaurantDateISO } from '@claro-de-luna/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

const ENTRANCE_CODE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // rotate weekly

@Injectable()
export class CheckinService {
  constructor(private readonly prisma: PrismaService) {}

  async checkin(userId: string, dto: CheckinDto): Promise<CheckinResponse> {
    const active = await this.getActiveEntranceCode();
    if (dto.qrToken !== active.code) {
      throw new BadRequestException(
        'El código no corresponde a la entrada de Claro de Luna.',
      );
    }

    const { start, end } = this.todayRange();
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        userId,
        status: { in: ['pending', 'confirmed'] },
        date: { gte: start, lt: end },
      },
    });
    if (!reservation) {
      throw new NotFoundException(
        'No encontramos una reserva para hoy a tu nombre.',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const welcomeMessage = this.buildWelcomeMessage(user?.name ?? null);

    const existing = await this.prisma.checkIn.findUnique({
      where: { reservationId: reservation.id },
    });
    if (existing) {
      return {
        reservationId: reservation.id,
        checkedInAt: existing.checkedInAt.toISOString(),
        welcomeMessage,
        alreadyCheckedIn: true,
      };
    }

    const checkIn = await this.prisma.checkIn.create({
      data: { reservationId: reservation.id, userId },
    });
    // Arrival confirms the reservation (pending -> confirmed).
    if (reservation.status === 'pending') {
      await this.prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: 'confirmed' },
      });
    }
    return {
      reservationId: reservation.id,
      checkedInAt: checkIn.checkedInAt.toISOString(),
      welcomeMessage,
      alreadyCheckedIn: false,
    };
  }

  // Returns whether the user already checked in for today's reservation.
  async getStatus(userId: string): Promise<CheckinStatusResponse> {
    const { start, end } = this.todayRange();
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        userId,
        status: { in: ['pending', 'confirmed'] },
        date: { gte: start, lt: end },
      },
      include: { checkIn: true },
    });

    if (!reservation?.checkIn) {
      return { checkedIn: false, checkedInAt: null };
    }
    return {
      checkedIn: true,
      checkedInAt: reservation.checkIn.checkedInAt.toISOString(),
    };
  }

  // Returns the active 4-digit entrance code, rotating it if a week has passed
  // since the last change. Authorization (qa/admin) is enforced at the controller.
  async getEntranceCode(): Promise<EntranceCodeResponse> {
    const record = await this.getActiveEntranceCode();
    return { code: record.code, updatedAt: record.updatedAt.toISOString() };
  }

  // Forces a new random entrance code. Authorization (admin) is enforced at the controller.
  async regenerateEntranceCode(): Promise<EntranceCodeResponse> {
    const existing = await this.prisma.entranceCode.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    const record = existing
      ? await this.prisma.entranceCode.update({
          where: { id: existing.id },
          data: { code: this.generateCode(), updatedAt: new Date() },
        })
      : await this.prisma.entranceCode.create({
          data: { code: this.generateCode() },
        });
    return { code: record.code, updatedAt: record.updatedAt.toISOString() };
  }

  // Reads the active code, creating it on first use and auto-rotating it weekly.
  private async getActiveEntranceCode(): Promise<{ code: string; updatedAt: Date }> {
    const existing = await this.prisma.entranceCode.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    if (!existing) {
      return this.prisma.entranceCode.create({ data: { code: this.generateCode() } });
    }
    const isExpired = Date.now() - existing.updatedAt.getTime() >= ENTRANCE_CODE_TTL_MS;
    if (isExpired) {
      return this.prisma.entranceCode.update({
        where: { id: existing.id },
        data: { code: this.generateCode(), updatedAt: new Date() },
      });
    }
    return existing;
  }

  // 4-digit code in the 1000-9999 range (no leading zeros for readability).
  private generateCode(): string {
    return String(randomInt(1000, 10000));
  }

  private buildWelcomeMessage(name: string | null): string {
    const greeting = name ? `¡Hola ${name}!` : '¡Hola!';
    return `${greeting} Te damos la bienvenida a Claro de Luna. Tu experiencia comienza ahora.`;
  }

  // Reservations are stored at UTC midnight from a YYYY-MM-DD string, so we match
  // "today" against that same UTC day window. The day is resolved in the
  // restaurant's timezone (not the server process timezone) so this stays correct
  // even when the API runs in UTC.
  private todayRange(): { start: Date; end: Date } {
    const today = restaurantDateISO();
    const start = new Date(`${today}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
  }
}
