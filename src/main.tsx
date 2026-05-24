(window as any).__stage = 'main:start'
import React from 'react'
;(window as any).__stage = 'main:react-imported'
import { createRoot } from 'react-dom/client'
;(window as any).__stage = 'main:dom-imported'
import { App } from './App'
;(window as any).__stage = 'main:app-imported'
import './index.css'
;(window as any).__stage = 'main:css-imported'

try {
  const root = document.getElementById('root')
  if (!root) throw new Error('no #root element')
  ;(window as any).__stage = 'main:root-found'
  createRoot(root).render(<App />)
  ;(window as any).__stage = 'main:rendered'
} catch (e) {
  (window as any).__stage = 'main:error:' + (e as Error).message
  throw e
}
