import type {
    GardenSection,
    GardenSectionCreateDto,
    GardenSectionUpdateDto,
    GuideQuestion,
    GuideQuestionCreateDto,
    GuideQuestionUpdateDto,
    MenuItem,
    MenuItemCreateDto,
    MenuItemUpdateDto,
    MenuSection,
    MenuSectionCreateDto,
    MenuSectionUpdateDto,
} from '@claro-de-luna/shared';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getMenu(): Promise<MenuSection[]> {
    const sections = await this.prisma.menuSection.findMany({
      orderBy: { order: 'asc' },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    return sections.map((section) => ({
      id: section.id,
      title: section.title,
      items: section.items.map((item) => this.toMenuItem(item)),
      order: section.order,
    }));
  }

  async getGarden(): Promise<GardenSection[]> {
    const sections = await this.prisma.gardenSection.findMany({ orderBy: { order: 'asc' } });
    return sections.map((section) => ({
      id: section.id,
      title: section.title,
      body: section.body,
      imageUrl: section.imageUrl ?? undefined,
      order: section.order,
    }));
  }

  createMenuSection(dto: MenuSectionCreateDto): Promise<MenuSection> {
    return this.prisma.menuSection
      .create({ data: { title: dto.title, order: dto.order ?? 0 } })
      .then((section) => ({ id: section.id, title: section.title, items: [], order: section.order }));
  }

  async updateMenuSection(id: string, dto: MenuSectionUpdateDto): Promise<MenuSection> {
    const section = await this.prisma.menuSection.update({
      where: { id },
      data: { title: dto.title, order: dto.order },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    return {
      id: section.id,
      title: section.title,
      items: section.items.map((item) => this.toMenuItem(item)),
      order: section.order,
    };
  }

  async deleteMenuSection(id: string): Promise<void> {
    await this.prisma.menuSection.delete({ where: { id } });
  }

  createMenuItem(dto: MenuItemCreateDto): Promise<MenuItem> {
    return this.prisma.menuItem
      .create({
        data: {
          sectionId: dto.sectionId,
          name: dto.name,
          description: dto.description,
          imageUrl: dto.imageUrl,
          tags: dto.tags ?? [],
          order: dto.order ?? 0,
        },
      })
      .then((item) => this.toMenuItem(item));
  }

  async updateMenuItem(id: string, dto: MenuItemUpdateDto): Promise<MenuItem> {
    const item = await this.prisma.menuItem.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        tags: dto.tags,
        order: dto.order,
      },
    });
    return this.toMenuItem(item);
  }

  async deleteMenuItem(id: string): Promise<void> {
    await this.prisma.menuItem.delete({ where: { id } });
  }

  createGardenSection(dto: GardenSectionCreateDto): Promise<GardenSection> {
    return this.prisma.gardenSection
      .create({
        data: {
          title: dto.title,
          body: dto.body,
          imageUrl: dto.imageUrl,
          order: dto.order ?? 0,
        },
      })
      .then((section) => ({
        id: section.id,
        title: section.title,
        body: section.body,
        imageUrl: section.imageUrl ?? undefined,
        order: section.order,
      }));
  }

  async updateGardenSection(id: string, dto: GardenSectionUpdateDto): Promise<GardenSection> {
    const section = await this.prisma.gardenSection.update({
      where: { id },
      data: { title: dto.title, body: dto.body, imageUrl: dto.imageUrl, order: dto.order },
    });
    return {
      id: section.id,
      title: section.title,
      body: section.body,
      imageUrl: section.imageUrl ?? undefined,
      order: section.order,
    };
  }

  async deleteGardenSection(id: string): Promise<void> {
    await this.prisma.gardenSection.delete({ where: { id } });
  }

  async getGuide(): Promise<GuideQuestion[]> {
    const questions = await this.prisma.guideQuestion.findMany({ orderBy: { order: 'asc' } });
    return questions.map((q) => ({ id: q.id, question: q.question, answer: q.answer }));
  }

  createGuideQuestion(dto: GuideQuestionCreateDto): Promise<GuideQuestion> {
    return this.prisma.guideQuestion
      .create({ data: { question: dto.question, answer: dto.answer, order: dto.order ?? 0 } })
      .then((q) => ({ id: q.id, question: q.question, answer: q.answer }));
  }

  async updateGuideQuestion(id: string, dto: GuideQuestionUpdateDto): Promise<GuideQuestion> {
    const q = await this.prisma.guideQuestion.update({
      where: { id },
      data: { question: dto.question, answer: dto.answer, order: dto.order },
    });
    return { id: q.id, question: q.question, answer: q.answer };
  }

  async deleteGuideQuestion(id: string): Promise<void> {
    await this.prisma.guideQuestion.delete({ where: { id } });
  }

  private toMenuItem(item: {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    tags: string[];
    order: number;
  }): MenuItem {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl ?? undefined,
      tags: item.tags,
      order: item.order,
    };
  }
}
