import type { User, UserRole } from '@claro-de-luna/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // Roles are resolved from env allowlists: admin > qa > guest.
  private resolveRole(email: string): UserRole {
    const normalized = email.toLowerCase();
    if (this.emailAllowlist('ADMIN_EMAILS').includes(normalized)) {
      return 'admin';
    }
    if (this.emailAllowlist('QA_EMAILS').includes(normalized)) {
      return 'qa';
    }
    return 'guest';
  }

  private emailAllowlist(key: 'ADMIN_EMAILS' | 'QA_EMAILS'): string[] {
    const raw = this.config.get<string>(key) ?? '';
    return raw
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
  }

  async findOrCreateByEmail(email: string): Promise<User> {
    const role = this.resolveRole(email);
    const user = await this.prisma.user.upsert({
      where: { email },
      update: { role },
      create: { email, role },
      select: { id: true, email: true, name: true, role: true },
    });
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
