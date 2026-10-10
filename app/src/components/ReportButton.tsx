import { useState } from 'react'
import { db } from '../engine/db'
import { Icon } from './Icon'

/** Saves a note about wrong or unclear content. Notes go into your backup file. */
export function ReportButton({ target }: { target: string }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  if (saved) {
    return <p className="font-mono text-xs text-ink-3">Note saved. It's included in your next backup export.</p>
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-3 hover:text-ink-2"
      >
        <Icon name="flag" size={13} /> Report a problem
      </button>
    )
  }
  return (
    <form
      className="w-full max-w-md space-y-2"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!note.trim()) return
        await db.reports.add({ target, note: note.trim(), at: Date.now() })
        setSaved(true)
      }}
    >
      <label className="block text-sm font-semibold" htmlFor={`report-${target}`}>
        What's wrong or unclear?
      </label>
      <textarea
        id={`report-${target}`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        autoFocus
        className="w-full rounded-lg border border-rule bg-surface p-2 text-sm outline-none focus:border-focus"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={!note.trim()} className="rounded-md bg-ink px-3 py-1.5 text-sm font-bold text-bg disabled:opacity-40">
          Save note
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-md px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-2">
          Cancel
        </button>
      </div>
    </form>
  )
}
