import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/overpass'
import '@fontsource-variable/source-serif-4'
import '@fontsource-variable/source-serif-4/wght-italic.css'
import '@fontsource/overpass-mono/400.css'
import '@fontsource/overpass-mono/600.css'
import './styles.css'
import { App } from './app/App'
import { applyTheme, useUi } from './state/ui'

applyTheme(useUi.getState().theme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
