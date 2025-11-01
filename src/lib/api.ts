// URL API - заменяется на build-time через VITE_API_URL или используется относительный путь
const API_URL = import.meta.env.VITE_API_URL || '/api';

import { getAuthToken, authenticatedFetch, removeAuthToken } from './auth';

export interface Application {
  id: number;
  name: string;
  phone: string;
  age: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  created_at: string;
}

export interface ScheduleGroup {
  id: number;
  group: string;
  age_range: string;
  days: string;
  time: string;
  location: string;
  spots: number;
  is_active: boolean;
  order: number;
}

export interface Location {
  id: number;
  title: string;
  address: string;
  description: string;
  features: string;
  icon_type: string;
  latitude?: number;
  longitude?: number;
  route_url?: string;
  order: number;
}

export interface Camp {
  id: number;
  title: string;
  location: string;
  location_desc: string;
  dates: string;
  duration: string;
  group_size: string;
  group_desc: string;
  training_desc: string;
  included_items: string;
  stats: string;
  is_active: boolean;
}

export interface Statistic {
  id: number;
  label: string;
  value: string;
  suffix: string;
  icon_type: string;
  order: number;
}

export interface AboutContent {
  id: number;
  title: string;
  description: string;
  paragraphs: string;
}

export interface Coach {
  id: number;
  name: string;
  position: string;
  description: string;
  photo: string;
  order: number;
}

export async function getSchedule(): Promise<ScheduleGroup[]> {
  const response = await fetch(`${API_URL}/schedule`);
  if (!response.ok) throw new Error('Failed to fetch schedule');
  return response.json();
}

export async function getLocations(): Promise<Location[]> {
  const response = await fetch(`${API_URL}/locations`);
  if (!response.ok) throw new Error('Failed to fetch locations');
  return response.json();
}

export async function getCamps(): Promise<Camp[]> {
  const response = await fetch(`${API_URL}/camps`);
  if (!response.ok) throw new Error('Failed to fetch camps');
  return response.json();
}

export async function getStats(): Promise<Statistic[]> {
  const response = await fetch(`${API_URL}/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function getAbout(): Promise<AboutContent> {
  const response = await fetch(`${API_URL}/about`);
  if (!response.ok) throw new Error('Failed to fetch about');
  return response.json();
}

export async function getCoaches(): Promise<Coach[]> {
  const response = await fetch(`${API_URL}/coaches`);
  if (!response.ok) throw new Error('Failed to fetch coaches');
  return response.json();
}

export async function createApplication(data: Omit<Application, 'id' | 'status' | 'created_at'>): Promise<Application> {
  const response = await fetch(`${API_URL}/applications`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to create application:', response.status, errorText);
    throw new Error(`Failed to create application: ${response.status} ${errorText}`);
  }
  
  return response.json();
}

// Функции админ API
const ADMIN_API_URL = `${API_URL}/admin`;

export async function adminLogin(username: string, password: string): Promise<{ token: string }> {
  const response = await fetch(`${ADMIN_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error('Failed to login');
  return response.json();
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) {
    removeAuthToken();
    throw new Error('No authentication token');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// Заявки
export async function getApplications(): Promise<Application[]> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/applications`);
  if (!response.ok) throw new Error('Failed to fetch applications');
  return response.json();
}

export async function updateApplication(id: number, status: string): Promise<Application> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update application');
  return response.json();
}

export async function deleteApplication(id: number): Promise<void> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/applications/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete application');
}

// Расписание
export async function adminGetSchedule(): Promise<ScheduleGroup[]> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/schedule`);
  if (!response.ok) throw new Error('Failed to fetch schedule');
  return response.json();
}

export async function createSchedule(data: Omit<ScheduleGroup, 'id'>): Promise<ScheduleGroup> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/schedule`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create schedule');
  return response.json();
}

export async function updateSchedule(id: number, data: Partial<ScheduleGroup>): Promise<ScheduleGroup> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/schedule/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update schedule');
  return response.json();
}

export async function deleteSchedule(id: number): Promise<void> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/schedule/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete schedule');
}

// Локации
export async function adminGetLocations(): Promise<Location[]> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/locations`);
  if (!response.ok) throw new Error('Failed to fetch locations');
  return response.json();
}

export async function createLocation(data: Omit<Location, 'id'>): Promise<Location> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/locations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create location');
  return response.json();
}

export async function updateLocation(id: number, data: Partial<Location>): Promise<Location> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update location');
  return response.json();
}

export async function deleteLocation(id: number): Promise<void> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/locations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete location');
}

// Сборы
export async function adminGetCamps(): Promise<Camp[]> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/camps`);
  if (!response.ok) throw new Error('Failed to fetch camps');
  return response.json();
}

export async function createCamp(data: Omit<Camp, 'id'>): Promise<Camp> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/camps`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create camp');
  return response.json();
}

export async function updateCamp(id: number, data: Partial<Camp>): Promise<Camp> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/camps/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update camp');
  return response.json();
}

export async function deleteCamp(id: number): Promise<void> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/camps/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete camp');
}

// Статистика
export async function adminGetStats(): Promise<Statistic[]> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function createStat(data: Omit<Statistic, 'id'>): Promise<Statistic> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/stats`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create stat');
  return response.json();
}

export async function updateStat(id: number, data: Partial<Statistic>): Promise<Statistic> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/stats/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update stat');
  return response.json();
}

export async function deleteStat(id: number): Promise<void> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/stats/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete stat');
}

// О нас
export async function adminGetAbout(): Promise<AboutContent> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/about`);
  if (!response.ok) throw new Error('Failed to fetch about');
  return response.json();
}

export async function updateAbout(id: number, data: Partial<AboutContent>): Promise<AboutContent> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/about/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update about');
  return response.json();
}

// Тренеры
export async function adminGetCoaches(): Promise<Coach[]> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/coaches`);
  if (!response.ok) throw new Error('Failed to fetch coaches');
  return response.json();
}

export async function createCoach(data: Omit<Coach, 'id'>): Promise<Coach> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/coaches`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create coach');
  return response.json();
}

export async function updateCoach(id: number, data: Partial<Coach>): Promise<Coach> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/coaches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update coach');
  return response.json();
}

export async function deleteCoach(id: number): Promise<void> {
  const response = await authenticatedFetch(`${ADMIN_API_URL}/coaches/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete coach');
}

// Загрузка файлов
export async function uploadPhoto(file: File): Promise<{ url: string }> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${ADMIN_API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Не устанавливаем Content-Type - браузер установит boundary для multipart/form-data
    },
    body: formData,
  });
  
  if (response.status === 401) {
    removeAuthToken();
    throw new Error('UNAUTHORIZED');
  }
  
  if (!response.ok) throw new Error('Failed to upload photo');
  return response.json();
}

