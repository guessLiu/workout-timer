import { useState } from 'react'
import type { WorkoutTemplate } from '../types'

interface Props {
  templates: WorkoutTemplate[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (fields: Omit<WorkoutTemplate, 'id'>) => void
  onUpdate: (id: string, fields: Partial<Omit<WorkoutTemplate, 'id'>>) => void
  onDelete: (id: string) => void
  onBack: () => void
}

type EditorState = { mode: 'add' } | { mode: 'edit'; id: string }

const DEFAULTS = { name: '', workSeconds: 20, restSeconds: 10, rounds: 8 }

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

interface EditorProps {
  initial: Omit<WorkoutTemplate, 'id'>
  onSave: (fields: Omit<WorkoutTemplate, 'id'>) => void
  onCancel: () => void
  title: string
}

function TemplateEditor({ initial, onSave, onCancel, title }: EditorProps) {
  const [fields, setFields] = useState(initial)

  function setNum(key: keyof typeof DEFAULTS, raw: string) {
    const n = parseInt(raw, 10)
    if (isNaN(n)) return
    const limits: Record<string, [number, number]> = {
      workSeconds: [5, 300],
      restSeconds: [0, 300],
      rounds: [1, 99],
    }
    const [min, max] = limits[key] ?? [1, 999]
    setFields(f => ({ ...f, [key]: clamp(n, min, max) }))
  }

  function handleSave() {
    const name = fields.name.trim()
    if (!name) return alert('Please enter a name')
    onSave({ ...fields, name })
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>

        <label className="field-label">Name</label>
        <input
          className="field-input"
          type="text"
          value={fields.name}
          onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Tabata"
          maxLength={40}
        />

        <div className="field-row">
          <div className="field-col">
            <label className="field-label">Work (sec)</label>
            <input
              className="field-input"
              type="number"
              inputMode="numeric"
              value={fields.workSeconds}
              onChange={e => setNum('workSeconds', e.target.value)}
              min={5} max={300}
            />
          </div>
          <div className="field-col">
            <label className="field-label">Rest (sec)</label>
            <input
              className="field-input"
              type="number"
              inputMode="numeric"
              value={fields.restSeconds}
              onChange={e => setNum('restSeconds', e.target.value)}
              min={0} max={300}
            />
          </div>
          <div className="field-col">
            <label className="field-label">Rounds</label>
            <input
              className="field-input"
              type="number"
              inputMode="numeric"
              value={fields.rounds}
              onChange={e => setNum('rounds', e.target.value)}
              min={1} max={99}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function TemplatesPage({
  templates, selectedId, onSelect, onAdd, onUpdate, onDelete, onBack,
}: Props) {
  const [editor, setEditor] = useState<EditorState | null>(null)

  function handleSave(fields: Omit<WorkoutTemplate, 'id'>) {
    if (!editor) return
    if (editor.mode === 'add') {
      onAdd(fields)
    } else {
      onUpdate(editor.id, fields)
    }
    setEditor(null)
  }

  function handleDelete(id: string, name: string) {
    if (window.confirm(`Delete "${name}"?`)) {
      onDelete(id)
    }
  }

  const editingTemplate = editor?.mode === 'edit'
    ? templates.find(t => t.id === editor.id)
    : null

  function formatSummary(t: WorkoutTemplate): string {
    const total = (t.workSeconds + t.restSeconds) * t.rounds
    const m = Math.floor(total / 60)
    const s = total % 60
    const duration = s === 0 ? `${m}m` : `${m}m ${s}s`
    return `${t.workSeconds}s work · ${t.restSeconds}s rest · ${t.rounds} rounds · ${duration}`
  }

  return (
    <div className="screen templates-screen">
      <div className="top-bar">
        <button className="btn-ghost" onClick={onBack}>← Timer</button>
        <span className="template-name">Templates</span>
        <button className="btn-ghost" onClick={() => setEditor({ mode: 'add' })}>+ Add</button>
      </div>

      <div className="template-list">
        {templates.map(t => (
          <div
            key={t.id}
            className={`template-card ${t.id === selectedId ? 'selected' : ''}`}
            onClick={() => { onSelect(t.id); onBack() }}
          >
            <div className="card-left">
              <div className="card-name">{t.name}</div>
              <div className="card-meta">{formatSummary(t)}</div>
            </div>
            <div className="card-actions" onClick={e => e.stopPropagation()}>
              <button
                className="icon-btn"
                onClick={() => setEditor({ mode: 'edit', id: t.id })}
                aria-label="Edit"
              >✏️</button>
              <button
                className="icon-btn danger"
                onClick={() => handleDelete(t.id, t.name)}
                aria-label="Delete"
              >🗑</button>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="empty-state">
            <p className="muted">No templates yet.</p>
            <button className="btn btn-primary" onClick={() => setEditor({ mode: 'add' })}>
              Add your first template
            </button>
          </div>
        )}
      </div>

      {editor && (
        <TemplateEditor
          title={editor.mode === 'add' ? 'New Template' : 'Edit Template'}
          initial={
            editingTemplate
              ? { name: editingTemplate.name, workSeconds: editingTemplate.workSeconds, restSeconds: editingTemplate.restSeconds, rounds: editingTemplate.rounds }
              : DEFAULTS
          }
          onSave={handleSave}
          onCancel={() => setEditor(null)}
        />
      )}
    </div>
  )
}
