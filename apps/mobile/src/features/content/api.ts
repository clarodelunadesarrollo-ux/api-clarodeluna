import type {
    GardenSection,
    GardenSectionCreateDto,
    GardenSectionUpdateDto,
    GuideQuestion,
    GuideQuestionCreateDto,
    GuideQuestionUpdateDto,
    ImageUploadResponse,
    MenuItem,
    MenuItemCreateDto,
    MenuItemUpdateDto,
    MenuSection,
    MenuSectionCreateDto,
    MenuSectionUpdateDto,
} from '@claro-de-luna/shared';
import * as FileSystem from 'expo-file-system/legacy';
import { ApiError, apiFetch } from '../../lib/apiClient';
import { API_URL } from '../../lib/config';
import { useAuthStore } from '../auth/authStore';

// --- Public reads (any authenticated role) ---

export function getMenu(): Promise<MenuSection[]> {
  return apiFetch('/content/menu');
}

export function getGarden(): Promise<GardenSection[]> {
  return apiFetch('/content/garden');
}

export function getGuide(): Promise<GuideQuestion[]> {
  return apiFetch('/content/guide');
}

// --- Menu admin CRUD ---

export function createMenuSection(dto: MenuSectionCreateDto): Promise<MenuSection> {
  return apiFetch('/content/menu/sections', { method: 'POST', body: JSON.stringify(dto) });
}

export function updateMenuSection(id: string, dto: MenuSectionUpdateDto): Promise<MenuSection> {
  return apiFetch(`/content/menu/sections/${id}`, { method: 'PATCH', body: JSON.stringify(dto) });
}

export function deleteMenuSection(id: string): Promise<void> {
  return apiFetch(`/content/menu/sections/${id}`, { method: 'DELETE' });
}

export function createMenuItem(dto: MenuItemCreateDto): Promise<MenuItem> {
  return apiFetch('/content/menu/items', { method: 'POST', body: JSON.stringify(dto) });
}

export function updateMenuItem(id: string, dto: MenuItemUpdateDto): Promise<MenuItem> {
  return apiFetch(`/content/menu/items/${id}`, { method: 'PATCH', body: JSON.stringify(dto) });
}

export function deleteMenuItem(id: string): Promise<void> {
  return apiFetch(`/content/menu/items/${id}`, { method: 'DELETE' });
}

// --- Garden admin CRUD ---

export function createGardenSection(dto: GardenSectionCreateDto): Promise<GardenSection> {
  return apiFetch('/content/garden/sections', { method: 'POST', body: JSON.stringify(dto) });
}

export function updateGardenSection(
  id: string,
  dto: GardenSectionUpdateDto,
): Promise<GardenSection> {
  return apiFetch(`/content/garden/sections/${id}`, { method: 'PATCH', body: JSON.stringify(dto) });
}

export function deleteGardenSection(id: string): Promise<void> {
  return apiFetch(`/content/garden/sections/${id}`, { method: 'DELETE' });
}

// --- Guide admin CRUD ---

export function createGuideQuestion(dto: GuideQuestionCreateDto): Promise<GuideQuestion> {
  return apiFetch('/content/guide/questions', { method: 'POST', body: JSON.stringify(dto) });
}

export function updateGuideQuestion(
  id: string,
  dto: GuideQuestionUpdateDto,
): Promise<GuideQuestion> {
  return apiFetch(`/content/guide/questions/${id}`, { method: 'PATCH', body: JSON.stringify(dto) });
}

export function deleteGuideQuestion(id: string): Promise<void> {
  return apiFetch(`/content/guide/questions/${id}`, { method: 'DELETE' });
}

// --- Image upload (multipart) ---
// React Native's fetch + FormData produces an unreliable multipart body on Expo
// (the backend receives a broken/empty stream). expo-file-system's uploadAsync
// streams the file natively and builds a correct multipart request.

export async function uploadImage(uri: string): Promise<string> {
  const { accessToken } = useAuthStore.getState();
  const name = uri.split('/').pop() ?? 'image.jpg';
  const ext = name.split('.').pop()?.toLowerCase();
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  let result: FileSystem.FileSystemUploadResult;
  try {
    result = await FileSystem.uploadAsync(`${API_URL}/content/images`, uri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'image',
      mimeType: mime,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
  } catch (cause) {
    throw new ApiError(0, `No se pudo conectar con el servidor (${String(cause)})`);
  }

  let body: (ImageUploadResponse & { message?: string }) | null = null;
  try {
    body = result.body ? (JSON.parse(result.body) as ImageUploadResponse & { message?: string }) : null;
  } catch {
    body = result.body ? { url: '', message: result.body.slice(0, 200) } : null;
  }

  if (result.status < 200 || result.status >= 300) {
    throw new ApiError(result.status, body?.message ?? `Error ${result.status} al subir la imagen`);
  }
  return (body as ImageUploadResponse).url;
}
