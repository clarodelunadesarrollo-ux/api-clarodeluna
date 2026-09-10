import {
    gardenSectionCreateSchema,
    gardenSectionUpdateSchema,
    guideQuestionCreateSchema,
    guideQuestionUpdateSchema,
    menuItemCreateSchema,
    menuItemUpdateSchema,
    menuSectionCreateSchema,
    menuSectionUpdateSchema,
    type GardenSection,
    type GardenSectionCreateDto,
    type GardenSectionUpdateDto,
    type GuideQuestion,
    type GuideQuestionCreateDto,
    type GuideQuestionUpdateDto,
    type ImageUploadResponse,
    type MenuItem,
    type MenuItemCreateDto,
    type MenuItemUpdateDto,
    type MenuSection,
    type MenuSectionCreateDto,
    type MenuSectionUpdateDto,
} from '@claro-de-luna/shared';
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard, type AuthUser } from '../common/jwt-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ContentService } from './content.service';
import { StorageService, type UploadedImage } from './storage.service';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(
    private readonly content: ContentService,
    private readonly storage: StorageService,
  ) {}

  @Get('menu')
  getMenu(): Promise<MenuSection[]> {
    return this.content.getMenu();
  }

  @Get('garden')
  getGarden(): Promise<GardenSection[]> {
    return this.content.getGarden();
  }

  @Post('menu/sections')
  createMenuSection(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(menuSectionCreateSchema)) body: MenuSectionCreateDto,
  ): Promise<MenuSection> {
    this.assertAdmin(user);
    return this.content.createMenuSection(body);
  }

  @Patch('menu/sections/:id')
  updateMenuSection(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(menuSectionUpdateSchema)) body: MenuSectionUpdateDto,
  ): Promise<MenuSection> {
    this.assertAdmin(user);
    return this.content.updateMenuSection(id, body);
  }

  @Delete('menu/sections/:id')
  deleteMenuSection(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    this.assertAdmin(user);
    return this.content.deleteMenuSection(id);
  }

  @Post('menu/items')
  createMenuItem(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(menuItemCreateSchema)) body: MenuItemCreateDto,
  ): Promise<MenuItem> {
    this.assertAdmin(user);
    return this.content.createMenuItem(body);
  }

  @Patch('menu/items/:id')
  updateMenuItem(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(menuItemUpdateSchema)) body: MenuItemUpdateDto,
  ): Promise<MenuItem> {
    this.assertAdmin(user);
    return this.content.updateMenuItem(id, body);
  }

  @Delete('menu/items/:id')
  deleteMenuItem(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    this.assertAdmin(user);
    return this.content.deleteMenuItem(id);
  }

  @Post('garden/sections')
  createGardenSection(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(gardenSectionCreateSchema)) body: GardenSectionCreateDto,
  ): Promise<GardenSection> {
    this.assertAdmin(user);
    return this.content.createGardenSection(body);
  }

  @Patch('garden/sections/:id')
  updateGardenSection(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(gardenSectionUpdateSchema)) body: GardenSectionUpdateDto,
  ): Promise<GardenSection> {
    this.assertAdmin(user);
    return this.content.updateGardenSection(id, body);
  }

  @Delete('garden/sections/:id')
  deleteGardenSection(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    this.assertAdmin(user);
    return this.content.deleteGardenSection(id);
  }

  @Get('guide')
  getGuide(): Promise<GuideQuestion[]> {
    return this.content.getGuide();
  }

  @Post('guide/questions')
  createGuideQuestion(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(guideQuestionCreateSchema)) body: GuideQuestionCreateDto,
  ): Promise<GuideQuestion> {
    this.assertAdmin(user);
    return this.content.createGuideQuestion(body);
  }

  @Patch('guide/questions/:id')
  updateGuideQuestion(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(guideQuestionUpdateSchema)) body: GuideQuestionUpdateDto,
  ): Promise<GuideQuestion> {
    this.assertAdmin(user);
    return this.content.updateGuideQuestion(id, body);
  }

  @Delete('guide/questions/:id')
  deleteGuideQuestion(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<void> {
    this.assertAdmin(user);
    return this.content.deleteGuideQuestion(id);
  }

  @Post('images')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: MAX_IMAGE_BYTES } }))
  async uploadImage(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: UploadedImage | undefined,
    @Req() req: Request,
  ): Promise<ImageUploadResponse> {
    this.assertAdmin(user);
    if (!file) {
      throw new BadRequestException('Adjuntá una imagen en el campo "image".');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Formato no permitido. Usá JPG, PNG o WEBP.');
    }
    const stored = await this.storage.save(file);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return { url: `${baseUrl}${stored.path}` };
  }

  private assertAdmin(user: AuthUser): void {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Solo un administrador puede gestionar el contenido.');
    }
  }
}
