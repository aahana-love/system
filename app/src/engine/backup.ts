import { db as defaultDb, TABLES, type StudyDB } from './db'

export const BACKUP_APP = 'system-design-study-plan'
export const BACKUP_VERSION = 1

export interface BackupFile {
  app: typeof BACKUP_APP
  version: number
  exportedAt: string
  tables: Record<(typeof TABLES)[number], unknown[]>
}

export async function exportBackup(database: StudyDB = defaultDb, now = Date.now()): Promise<BackupFile> {
  await database.meta.put({ key: 'lastBackupAt', value: now })
  const tables = {} as BackupFile['tables']
  for (const name of TABLES) tables[name] = await database.table(name).toArray()
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: new Date(now).toISOString(), tables }
}

export function backupFileName(now = new Date()): string {
  const d = now.toISOString().slice(0, 10)
  return `system-design-progress-${d}.json`
}

export class BackupError extends Error {}

/** Checks the file and returns it typed, or throws a BackupError saying what's wrong. */
export function parseBackup(data: unknown): BackupFile {
  if (!data || typeof data !== 'object') throw new BackupError('This file is not a progress backup (not a JSON object).')
  const f = data as Partial<BackupFile>
  if (f.app !== BACKUP_APP) throw new BackupError('This JSON file was not exported from this app.')
  if (typeof f.version !== 'number' || f.version > BACKUP_VERSION) {
    throw new BackupError('This backup comes from a newer version of the app. Update the app, then import again.')
  }
  if (!f.tables || typeof f.tables !== 'object') throw new BackupError('The backup has no data tables.')
  for (const name of TABLES) {
    const rows = (f.tables as Record<string, unknown>)[name]
    if (rows !== undefined && !Array.isArray(rows)) throw new BackupError(`The "${name}" table in the backup is damaged.`)
  }
  return f as BackupFile
}

/** Replaces all progress with the backup's contents. */
export async function importBackup(data: unknown, database: StudyDB = defaultDb) {
  const file = parseBackup(data)
  const counts: Record<string, number> = {}
  await database.transaction('rw', TABLES.map((t) => database.table(t)), async () => {
    for (const name of TABLES) {
      const rows = (file.tables[name] ?? []) as object[]
      await database.table(name).clear()
      await database.table(name).bulkAdd(rows)
      counts[name] = rows.length
    }
  })
  return counts
}

export async function resetAll(database: StudyDB = defaultDb) {
  await database.transaction('rw', TABLES.map((t) => database.table(t)), async () => {
    for (const name of TABLES) await database.table(name).clear()
  })
}
