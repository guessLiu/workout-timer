import { useState, useCallback } from 'react'
import type { WorkoutTemplate } from '../types'
import { loadTemplates, saveTemplates, loadLastUsedTemplateId, saveLastUsedTemplateId } from '../storage'

function genId(): string {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function useTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(loadTemplates)

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const ts = loadTemplates()
    const lastId = loadLastUsedTemplateId()
    return ts.find(t => t.id === lastId) ? lastId : (ts[0]?.id ?? null)
  })

  const selectedTemplate = templates.find(t => t.id === selectedId) ?? templates[0] ?? null

  const addTemplate = useCallback((fields: Omit<WorkoutTemplate, 'id'>): string => {
    const t: WorkoutTemplate = { ...fields, id: genId() }
    setTemplates(prev => {
      const updated = [...prev, t]
      saveTemplates(updated)
      return updated
    })
    setSelectedId(t.id)
    saveLastUsedTemplateId(t.id)
    return t.id
  }, [])

  const updateTemplate = useCallback((id: string, fields: Partial<Omit<WorkoutTemplate, 'id'>>): void => {
    setTemplates(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...fields } : t)
      saveTemplates(updated)
      return updated
    })
  }, [])

  const deleteTemplate = useCallback((id: string): void => {
    setTemplates(prev => {
      const updated = prev.filter(t => t.id !== id)
      saveTemplates(updated)
      if (selectedId === id) {
        const next = updated[0]?.id ?? null
        setSelectedId(next)
        if (next) saveLastUsedTemplateId(next)
      }
      return updated
    })
  }, [selectedId])

  const selectTemplate = useCallback((id: string): void => {
    setSelectedId(id)
    saveLastUsedTemplateId(id)
  }, [])

  return { templates, selectedTemplate, selectedId, addTemplate, updateTemplate, deleteTemplate, selectTemplate }
}
