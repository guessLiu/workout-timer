import { useState } from 'react'
import TimerScreen from './components/TimerScreen'
import TemplatesPage from './components/TemplatesPage'
import { useTemplates } from './hooks/useTemplates'

type View = 'timer' | 'templates'

export default function App() {
  const [view, setView] = useState<View>('timer')
  const {
    templates,
    selectedTemplate,
    selectedId,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    selectTemplate,
  } = useTemplates()

  return (
    <div className="app">
      {view === 'timer' ? (
        <TimerScreen
          template={selectedTemplate}
          onGoToTemplates={() => setView('templates')}
        />
      ) : (
        <TemplatesPage
          templates={templates}
          selectedId={selectedId}
          onSelect={selectTemplate}
          onAdd={addTemplate}
          onUpdate={updateTemplate}
          onDelete={deleteTemplate}
          onBack={() => setView('timer')}
        />
      )}
    </div>
  )
}
