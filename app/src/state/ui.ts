import { create } from 'zustand'

export type Theme = 'system' | 'light' | 'dark'

const THEME_KEY = 'sd-theme'

function readTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'light' || t === 'dark' ? t : 'system'
  } catch {
    return 'system'
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme
}

interface UiState {
  /** Stack of term ids open in the drawer; the last one is shown. */
  drawer: string[]
  openTerm: (id: string) => void
  backTerm: () => void
  closeDrawer: () => void
  paletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useUi = create<UiState>((set) => ({
  drawer: [],
  openTerm: (id) =>
    set((s) => {
      const i = s.drawer.indexOf(id)
      // Re-opening a term already in the stack jumps back to it.
      return { drawer: i >= 0 ? s.drawer.slice(0, i + 1) : [...s.drawer, id] }
    }),
  backTerm: () => set((s) => ({ drawer: s.drawer.slice(0, -1) })),
  closeDrawer: () => set({ drawer: [] }),
  paletteOpen: false,
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  theme: readTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* storage blocked: theme still applies for this visit */
    }
    applyTheme(theme)
    set({ theme })
  },
}))
