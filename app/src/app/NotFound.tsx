import { Link } from 'react-router'

export function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-24">
      <p className="font-mono text-sm text-ink-3">404</p>
      <h1 className="mt-2 text-3xl font-extrabold">This stop isn't on the map</h1>
      <p className="mt-3 text-ink-2">The address doesn't match any page in the app.</p>
      <Link to="/roadmap" className="mt-6 inline-block font-semibold text-focus underline underline-offset-4">
        Open the roadmap
      </Link>
    </div>
  )
}
