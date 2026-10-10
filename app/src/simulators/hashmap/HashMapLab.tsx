import { useState } from 'react'
import { bucketOf, create, get, hashKey, loadFactor, longestChain, put, remove, resize, size, type HashMap } from './hashModel'
import { Segmented } from '../../components/Segmented'

const SAMPLES = ['nashik', 'pune', 'mumbai', 'delhi', 'goa', 'kochi', 'jaipur', 'surat', 'indore', 'patna']

interface Note {
  tone: 'good' | 'miss' | 'bad' | 'info'
  text: string
  bucket: number | null
  /** Index in the chain that was reached, for highlighting. */
  reached: number | null
}

/** Insert keys, look them up, and watch buckets and collisions. */
export function HashMapLab() {
  const [map, setMap] = useState<HashMap>(() => create(8))
  const [key, setKey] = useState('nashik')
  const [note, setNote] = useState<Note | null>(null)
  const k = key.trim().toLowerCase()
  const buckets = map.buckets.length

  const insert = () => {
    if (!k) return
    const r = put(map, k, `value of ${k}`)
    setMap(r.map)
    setNote({
      tone: r.replaced ? 'info' : r.collided ? 'miss' : 'good',
      text: r.replaced
        ? `"${k}" was already there: its value was replaced after ${r.comparisons} comparison${r.comparisons === 1 ? '' : 's'}.`
        : r.collided
          ? `Collision: bucket ${r.bucket} already held another key, so "${k}" joined the chain.`
          : `"${k}" went into the empty bucket ${r.bucket}.`,
      bucket: r.bucket,
      reached: null,
    })
  }
  const lookup = () => {
    if (!k) return
    const r = get(map, k)
    setNote({
      tone: r.found ? 'good' : 'bad',
      text: r.found
        ? `Found "${k}" in bucket ${r.bucket} after ${r.comparisons} comparison${r.comparisons === 1 ? '' : 's'}. No other bucket was touched.`
        : `"${k}" is not in the map. Only bucket ${r.bucket} was checked (${r.comparisons} comparison${r.comparisons === 1 ? '' : 's'}).`,
      bucket: r.bucket,
      reached: r.found ? r.comparisons - 1 : null,
    })
  }
  const del = () => {
    if (!k) return
    const r = remove(map, k)
    setMap(r.map)
    setNote({ tone: r.removed ? 'info' : 'bad', text: r.removed ? `Removed "${k}" from bucket ${r.bucket}.` : `"${k}" wasn't in the map.`, bucket: r.bucket, reached: null })
  }
  const fill = () => {
    let m = map
    for (const s of SAMPLES) m = put(m, s, `value of ${s}`).map
    setMap(m)
    setNote({ tone: 'info', text: 'Added ten city names. Look for buckets with more than one key: those are collisions.', bucket: null, reached: null })
  }

  const lf = loadFactor(map)
  const preview = k ? `hash("${k}") = ${hashKey(k).toLocaleString('en-US')}, and ${hashKey(k).toLocaleString('en-US')} mod ${buckets} = bucket ${bucketOf(map, k)}` : 'Type a key.'

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="Hash map lab">
      <p className="text-lg font-extrabold">Hash map lab</p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block min-w-40 flex-1">
          <span className="block text-xs font-bold tracking-wide text-ink-2 uppercase">Key</span>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && insert()}
            className="mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 font-mono text-sm"
            autoComplete="off"
          />
        </label>
        <button type="button" onClick={insert} className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-bg">
          Insert
        </button>
        <button type="button" onClick={lookup} className="rounded-lg border border-ink px-4 py-2 text-sm font-bold">
          Look up
        </button>
        <button type="button" onClick={del} className="rounded-lg border border-rule px-4 py-2 text-sm font-semibold hover:bg-surface-2">
          Delete
        </button>
        <button type="button" onClick={fill} className="rounded-lg border border-rule px-4 py-2 text-sm font-semibold hover:bg-surface-2">
          Add 10 sample keys
        </button>
        <div className="w-44">
          <Segmented label="Buckets" value={buckets} options={[4, 8, 16]} onChange={(n) => setMap(resize(map, n))} />
        </div>
      </div>
      <p className="mt-3 font-mono text-xs text-ink-2">{preview}</p>

      <ol className="mt-4 space-y-1.5" aria-label="Buckets">
        {map.buckets.map((chain, b) => (
          <li key={b} className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${note?.bucket === b ? 'border-ink' : 'border-rule'}`}>
            <span className="w-14 shrink-0 font-mono text-xs text-ink-3">bucket {b}</span>
            <span className="flex flex-wrap items-center gap-1.5">
              {chain.length === 0 && <span className="font-mono text-xs text-ink-3">empty</span>}
              {chain.map((e, i) => (
                <span key={e.key} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-ink-3">→</span>}
                  <span className={`rounded-md border px-2 py-0.5 font-mono text-xs ${note?.bucket === b && note.reached === i ? 'border-good bg-good-bg font-bold' : 'border-ink-3 bg-surface-2'}`}>
                    {e.key}
                  </span>
                </span>
              ))}
            </span>
          </li>
        ))}
      </ol>

      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm">
        <div>
          <dt className="inline text-ink-2">Keys: </dt>
          <dd className="inline font-mono font-bold">{size(map)}</dd>
        </div>
        <div>
          <dt className="inline text-ink-2">Load factor: </dt>
          <dd className="inline font-mono font-bold">{lf.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="inline text-ink-2">Longest chain: </dt>
          <dd className="inline font-mono font-bold">{longestChain(map)}</dd>
        </div>
      </dl>
      {note && (
        <p
          className={`mt-3 rounded-lg border px-4 py-3 text-sm font-semibold ${
            note.tone === 'good' ? 'border-good bg-good-bg' : note.tone === 'bad' ? 'border-bad bg-bad-bg' : 'border-rule bg-surface-2'
          }`}
          role="status"
        >
          {note.text}
        </p>
      )}
    </figure>
  )
}
