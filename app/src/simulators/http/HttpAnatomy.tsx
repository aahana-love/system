import { useState } from 'react'

interface Part {
  text: string
  key: string
}

const EXPLAIN: Record<string, { title: string; body: string }> = {
  method: { title: 'Method', body: 'What you want to do with the resource. POST means "create something new here".' },
  path: { title: 'Path', body: 'Which resource on the server. Together with the Host header it is the URL you would type.' },
  version: { title: 'Protocol version', body: 'The version of HTTP spoken on this connection.' },
  host: { title: 'Host header', body: 'The domain name the client wants. One server can host many sites on the same IP address, and this line picks one.' },
  auth: { title: 'Authorization header', body: 'Proves who is calling. A bearer token is a long random string the server issued at login. HTTP itself remembers nothing between requests, so it travels with every one.' },
  ctype: { title: 'Content-Type header', body: 'Tells the receiver how to read the body: here, JSON.' },
  clen: { title: 'Content-Length header', body: 'How many bytes of body follow, so the receiver knows where the message ends.' },
  blank: { title: 'Blank line', body: 'Separates the headers from the body. Its position is part of the format.' },
  body: { title: 'Body', body: 'The payload. A GET usually has none; a POST or PUT carries the data to store.' },
  status: { title: 'Status line', body: '201 means "created". The first digit is the class: 2 success, 3 redirect, 4 your mistake, 5 the server\'s mistake.' },
  location: { title: 'Location header', body: 'Where the new resource now lives. The client can GET it next.' },
  cache: { title: 'Cache-Control header', body: '"no-store" tells caches not to keep a copy of this response.' },
  rbody: { title: 'Response body', body: 'The created order, including the id the server assigned.' },
}

const REQUEST: Part[][] = [
  [
    { text: 'POST', key: 'method' },
    { text: ' ', key: '' },
    { text: '/orders', key: 'path' },
    { text: ' ', key: '' },
    { text: 'HTTP/1.1', key: 'version' },
  ],
  [{ text: 'Host: api.shop.in', key: 'host' }],
  [{ text: 'Authorization: Bearer eyJhbGciOi…', key: 'auth' }],
  [{ text: 'Content-Type: application/json', key: 'ctype' }],
  [{ text: 'Content-Length: 23', key: 'clen' }],
  [{ text: '(blank line)', key: 'blank' }],
  [{ text: '{"item":"lamp","qty":2}', key: 'body' }],
]

const RESPONSE: Part[][] = [
  [{ text: 'HTTP/1.1 201 Created', key: 'status' }],
  [{ text: 'Content-Type: application/json', key: 'ctype' }],
  [{ text: 'Location: /orders/17', key: 'location' }],
  [{ text: 'Cache-Control: no-store', key: 'cache' }],
  [{ text: '(blank line)', key: 'blank' }],
  [{ text: '{"id":17,"item":"lamp","qty":2}', key: 'rbody' }],
]

/** A raw request and response; click any part to see what it does. */
export function HttpAnatomy() {
  const [tab, setTab] = useState<'request' | 'response'>('request')
  const [picked, setPicked] = useState('method')
  const lines = tab === 'request' ? REQUEST : RESPONSE
  const info = EXPLAIN[picked] ?? EXPLAIN.method

  return (
    <figure className="wide my-10 rounded-2xl border border-rule bg-surface p-4 sm:p-6 lg:-mx-16" aria-label="HTTP message anatomy">
      <div className="flex gap-2" role="tablist" aria-label="Message">
        {(['request', 'response'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => {
              setTab(t)
              setPicked(t === 'request' ? 'method' : 'status')
            }}
            className={`rounded-lg px-4 py-1.5 text-sm font-bold capitalize ${tab === t ? 'bg-ink text-bg' : 'border border-rule text-ink-2'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-rule bg-surface-2 px-4 py-3 font-mono text-sm leading-8">
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre">
            {line.map((p, j) =>
              p.key ? (
                <button
                  key={j}
                  type="button"
                  onClick={() => setPicked(p.key)}
                  aria-pressed={picked === p.key}
                  className={`rounded px-1 py-0.5 text-left ${picked === p.key ? 'bg-ink text-bg' : 'hover:bg-surface'}`}
                >
                  {p.text}
                </button>
              ) : (
                <span key={j}>{p.text}</span>
              ),
            )}
          </div>
        ))}
      </div>
      <div className="mt-4" aria-live="polite">
        <p className="font-extrabold">{info.title}</p>
        <p className="mt-1 text-sm text-ink-2">{info.body}</p>
      </div>
    </figure>
  )
}
