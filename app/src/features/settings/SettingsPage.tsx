import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../engine/db'
import { BackupError, backupFileName, exportBackup, importBackup, parseBackup, resetAll, type BackupFile } from '../../engine/backup'
import { useMeta } from '../../engine/hooks'
import { useUi, type Theme } from '../../state/ui'

export function SettingsPage() {
  const { theme, setTheme } = useUi()
  const lastBackupAt = useMeta<number>('lastBackupAt')
  const reports = useLiveQuery(() => db.reports.orderBy('at').reverse().toArray(), [])
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<BackupFile | null>(null)
  const [message, setMessage] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null)
  const [confirmText, setConfirmText] = useState('')

  const doExport = async () => {
    const data = await exportBackup()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = backupFileName()
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ tone: 'good', text: `Exported ${a.download}. Keep it somewhere safe, like your OneDrive.` })
  }

  const onFile = async (file: File) => {
    setMessage(null)
    try {
      const parsed = parseBackup(JSON.parse(await file.text()))
      setPending(parsed)
    } catch (e) {
      setMessage({
        tone: 'bad',
        text: e instanceof BackupError ? e.message : 'That file is not valid JSON. Pick the .json file you exported from this app.',
      })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const doImport = async () => {
    if (!pending) return
    const counts = await importBackup(pending)
    setPending(null)
    setMessage({ tone: 'good', text: `Imported progress for ${counts.progress} concepts and ${counts.reviewCards} flashcards.` })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-mono text-xs tracking-wider text-ink-3 uppercase">Your data stays in this browser</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Backup and settings</h1>

      {message && (
        <p
          role="status"
          className={`mt-6 rounded-xl border px-5 py-3 ${message.tone === 'good' ? 'border-good bg-good-bg' : 'border-bad bg-bad-bg'}`}
        >
          {message.text}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-bold">Back up your progress</h2>
        <p className="mt-1 text-ink-2">
          Progress is saved in this browser only. Clearing site data or switching browsers loses it, so export a backup every
          week.
        </p>
        <p className="mt-3 font-mono text-sm text-ink-2">
          Last backup: {lastBackupAt ? new Date(lastBackupAt).toLocaleString() : 'never'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={doExport} className="rounded-lg bg-ink px-5 py-2.5 font-bold text-bg">
            Export progress
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border border-ink px-5 py-2.5 font-bold">
            Import progress
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="Choose a backup file"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </div>
        {pending && (
          <div className="mt-5 rounded-xl border border-ink bg-surface px-5 py-4">
            <p className="font-bold">Replace your current progress?</p>
            <p className="mt-1 text-ink-2">
              The file from {new Date(pending.exportedAt).toLocaleString()} has {pending.tables.progress?.length ?? 0} concepts,{' '}
              {pending.tables.attempts?.length ?? 0} answers and {pending.tables.reviewCards?.length ?? 0} flashcards. Everything
              currently in this browser will be replaced.
            </p>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={doImport} className="rounded-lg bg-ink px-4 py-2 font-bold text-bg">
                Replace progress
              </button>
              <button type="button" onClick={() => setPending(null)} className="rounded-lg px-4 py-2 font-semibold text-ink-2 hover:bg-surface-2">
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Theme</h2>
        <div className="mt-3 inline-flex rounded-lg border border-rule bg-surface p-1" role="radiogroup" aria-label="Theme">
          {(['system', 'light', 'dark'] as Theme[]).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={theme === t}
              onClick={() => setTheme(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold capitalize ${theme === t ? 'bg-ink text-bg' : 'text-ink-2'}`}
            >
              {t === 'system' ? 'Match system' : t}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Your problem reports</h2>
        {!reports || reports.length === 0 ? (
          <p className="mt-1 text-ink-2">None yet. Use "Report a problem" under any lesson or answer to note something wrong or unclear.</p>
        ) : (
          <ul className="mt-3 divide-y divide-rule rounded-xl border border-rule bg-surface">
            {reports.map((r) => (
              <li key={r.id} className="flex items-start gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-ink-3">
                    {r.target} · {new Date(r.at).toLocaleDateString()}
                  </p>
                  <p className="mt-0.5">{r.note}</p>
                </div>
                <button type="button" onClick={() => db.reports.delete(r.id!)} className="text-sm text-ink-3 hover:text-bad">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 rounded-xl border border-bad/40 px-5 py-5">
        <h2 className="text-xl font-bold">Erase all progress</h2>
        <p className="mt-1 text-ink-2">Deletes every answer, flashcard schedule and note in this browser. Export first if you might want it back.</p>
        <label className="mt-3 block text-sm font-semibold" htmlFor="erase-confirm">
          Type <span className="font-mono">erase</span> to confirm
        </label>
        <div className="mt-1 flex gap-3">
          <input
            id="erase-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-40 rounded-lg border border-rule bg-surface px-3 py-2 font-mono text-sm"
          />
          <button
            type="button"
            disabled={confirmText !== 'erase'}
            onClick={async () => {
              await resetAll()
              setConfirmText('')
              setMessage({ tone: 'good', text: 'All progress erased.' })
            }}
            className="rounded-lg bg-bad px-4 py-2 font-bold text-white disabled:opacity-35"
          >
            Erase all progress
          </button>
        </div>
      </section>
    </div>
  )
}
