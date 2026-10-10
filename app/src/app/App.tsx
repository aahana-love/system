import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { MotionConfig } from 'motion/react'
import { Shell } from './Shell'
import { HomePage } from '../features/home/HomePage'
import { NotFound } from './NotFound'

// Pages other than Today load on first visit.
const RoadmapPage = lazy(() => import('../features/roadmap/RoadmapPage').then((m) => ({ default: m.RoadmapPage })))
const ConceptPage = lazy(() => import('../features/concept/ConceptPage').then((m) => ({ default: m.ConceptPage })))
const ReviewPage = lazy(() => import('../features/review/ReviewPage').then((m) => ({ default: m.ReviewPage })))
const MistakesPage = lazy(() => import('../features/mistakes/MistakesPage').then((m) => ({ default: m.MistakesPage })))
const SettingsPage = lazy(() => import('../features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/roadmap', element: <RoadmapPage /> },
      { path: '/c/:id/:step?', element: <ConceptPage /> },
      { path: '/review', element: <ReviewPage /> },
      { path: '/mistakes', element: <MistakesPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  )
}
