// Cross-platform storage: AsyncStorage on native, localStorage on web, in-memory fallback
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let memoryStore: Record<string, string> = {};

// Minimal AsyncStorage-like shim to satisfy types; undefined on web
type AsyncStorageLike = { getItem: (k: string) => Promise<string | null>; setItem: (k: string, v: string) => Promise<void>; removeItem: (k: string) => Promise<void>; };
// Use the real AsyncStorage on native; on web, the package provides a shim that delegates to localStorage
const AS: AsyncStorageLike | undefined = AsyncStorage as unknown as AsyncStorageLike;

// Lazy import to avoid bundling issues on web
// On native we fallback to in-memory until AsyncStorage is installed

const isWeb = Platform.OS === 'web';

export async function getItem(key: string): Promise<string | null> {
  try {
  if (!isWeb && AS) return await AS.getItem(key);
    if (isWeb && typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage.getItem(key);
    }
  } catch {}
  return memoryStore[key] ?? null;
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
  if (!isWeb && AS) return void (await AS.setItem(key, value));
    if (isWeb && typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      (globalThis as any).localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryStore[key] = value;
}

export async function removeItem(key: string): Promise<void> {
  try {
  if (!isWeb && AS) return void (await AS.removeItem(key));
    if (isWeb && typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      (globalThis as any).localStorage.removeItem(key);
      return;
    }
  } catch {}
  delete memoryStore[key];
}

export async function getJSON<T = any>(key: string, fallback: T): Promise<T> {
  const raw = await getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJSON(key: string, value: any): Promise<void> {
  await setItem(key, JSON.stringify(value));
}
