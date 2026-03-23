import { useState, useEffect } from 'react'
import type { CalendarEntry } from '../../../types/youtube'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Plus, GripVertical } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableEntry({ entry }: { entry: CalendarEntry; key?: string | number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: entry.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={{ ...style, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 8, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'grab' }} {...attributes} {...listeners} className="calendar-entry">
      <GripVertical size={14} color="var(--text-tertiary)" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{entry.format} • {entry.status}</div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cp-calendar') || '[]')
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('cp-calendar', JSON.stringify(entries))
  }, [entries])

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setEntries((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const addEntry = () => {
    const newEntry: CalendarEntry = {
      id: crypto.randomUUID(),
      title: 'New Video Idea',
      date: new Date().toISOString(),
      format: 'Long-form',
      status: 'Idea'
    }
    setEntries([...entries, newEntry])
  }

  const startDate = startOfWeek(new Date())
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>Content Calendar</h2>
        <button onClick={addEntry} style={{ background: 'var(--brand)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 16, flex: 1, minHeight: 0 }}>
          {weekDays.map(day => {
            const dayEntries = entries.filter(e => isSameDay(new Date(e.date), day))
            return (
              <div key={day.toISOString()} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{format(day, 'EEEE')}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{format(day, 'd')}</div>
                </div>
                <div style={{ padding: 12, flex: 1, overflowY: 'auto' }}>
                  <SortableContext items={dayEntries} strategy={verticalListSortingStrategy}>
                    {dayEntries.map(entry => <SortableEntry key={entry.id} entry={entry} />)}
                  </SortableContext>
                </div>
              </div>
            )
          })}
        </div>
      </DndContext>
    </div>
  )
}
