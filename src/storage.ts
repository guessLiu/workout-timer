import type { WorkoutTemplate } from './types'

export const STORAGE_KEYS = {
  templates: 'workout_timer_templates',
  lastUsedTemplateId: 'workout_timer_last_template',
} as const

function getDefaultTemplates(): WorkoutTemplate[] {
  return [
    { id: 'default-tabata', name: 'Tabata', workSeconds: 20, restSeconds: 10, rounds: 8 },
    { id: 'default-hiit', name: 'HIIT 30/30', workSeconds: 30, restSeconds: 30, rounds: 10 },
    { id: 'default-emom', name: 'EMOM 40/20', workSeconds: 40, restSeconds: 20, rounds: 6 },
  ]
}

export function loadTemplates(): WorkoutTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.templates)
    if (!raw) return getDefaultTemplates()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultTemplates()
  } catch {
    return getDefaultTemplates()
  }
}

export function saveTemplates(templates: WorkoutTemplate[]): void {
  localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(templates))
}

export function loadLastUsedTemplateId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.lastUsedTemplateId)
}

export function saveLastUsedTemplateId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.lastUsedTemplateId, id)
}
