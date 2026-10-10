import { readFile } from 'node:fs/promises'
import { expect, test, type Locator } from '@playwright/test'
import { questions as dnsQuestions } from '../../src/content/concepts/dns/questions.ts'
import { cards as dnsCards } from '../../src/content/concepts/dns/cards.ts'
import type { Question } from '../../src/content/types.ts'

const plain = (s: string) => s.replace(/[`*]/g, '').replace(/\s+/g, ' ').trim()

/** Answers a question correctly through the UI, inside `scope`. */
async function answer(scope: Locator, q: Question, verify = true) {
  switch (q.type) {
    case 'single':
      await scope.getByRole('radio').filter({ hasText: plain(q.options[q.answer].text) }).click()
      break
    case 'multi':
      for (const i of q.answers) await scope.getByRole('checkbox').filter({ hasText: plain(q.options[i].text) }).click()
      break
    case 'numeric':
      await scope.locator('[data-numeric-input]').fill(String(q.answer))
      break
    case 'match':
      for (const [i, p] of q.pairs.entries()) await scope.getByLabel(`Match for ${p.left}`, { exact: true }).selectOption(String(i))
      break
    case 'spot': {
      const n = q.diagram.nodes.find((x) => x.id === q.answer)!
      await scope.getByRole('button', { name: n.sub ? `${n.label}, ${n.sub}` : n.label, exact: true }).click()
      break
    }
    case 'order':
      for (let i = 0; i < q.items.length; i++) {
        for (;;) {
          const current = await scope.locator('[data-order-item]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.orderItem))
          if (current.indexOf(q.items[i]) <= i) break
          await scope.getByRole('button', { name: `Move up: ${q.items[i]}`, exact: true }).click()
        }
      }
      break
  }
  await scope.getByRole('button', { name: 'Check answer' }).click()
  if (verify) await expect(scope.getByRole('status').filter({ hasText: 'Correct' })).toBeVisible()
}

test('a new learner completes the DNS loop and their progress survives', async ({ page }) => {
  // Today points at the first written lesson.
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'DNS', level: 1 })).toBeVisible()
  await page.getByRole('link', { name: /Continue: Prerequisites/ }).click()

  // Prerequisite gate: read one primer in the drawer, skip the other.
  await expect(page.getByRole('heading', { name: 'Before you start' })).toBeVisible()
  await page.getByRole('button', { name: 'Read primer' }).first().click()
  const drawer = page.getByRole('dialog', { name: 'Term details' })
  await expect(drawer).toContainText('Client–server model')
  await drawer.getByRole('button', { name: "I've read this primer" }).click()
  await expect(drawer).toContainText('Primer read')
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await page.getByRole('button', { name: 'Start anyway (skip 1)' }).click()

  // Learn: the simulator runs a full lookup (reduced motion makes it instant).
  await expect(page).toHaveURL(/\/c\/dns\/learn$/)
  const sim = page.getByRole('figure', { name: 'DNS lookup simulator' })
  await sim.getByRole('button', { name: 'Look up' }).click()
  await expect(sim.getByRole('status')).toContainText('115 ms')
  await sim.getByRole('button', { name: 'Look up' }).click()
  await expect(sim.getByRole('status')).toContainText('0 ms')

  // Inline term links open the drawer without leaving the lesson.
  await page.locator('article button.term').first().click()
  await expect(drawer).toBeVisible()
  await page.keyboard.press('Escape')

  // Quick checks unlock Theory.
  // The panel switches to "passed" as soon as the last one is right, so only
  // the first two are checked individually.
  const checks = dnsQuestions.filter((x) => x.check)
  for (const [i, q] of checks.entries()) {
    await answer(page.locator(`[data-check="${q.id}"]`), q, i < checks.length - 1)
  }
  await expect(page.getByText('You passed the checks. Theory is unlocked.')).toBeVisible()
  await page.getByRole('link', { name: 'Go to Theory' }).click()

  // Theory → Practice.
  await expect(page.getByRole('heading', { name: 'The tree, read right to left' })).toBeVisible()
  await page.getByRole('button', { name: /I've finished reading/ }).click()
  await page.getByRole('button', { name: 'Start practice' }).click()

  // Practice: every question type, answered through the UI.
  const practice = dnsQuestions.filter((x) => !x.check)
  let previous = ''
  for (let i = 0; i < practice.length; i++) {
    await expect(page.getByText(`Question ${i + 1} of ${practice.length}`)).toBeVisible()
    // The old question fades out before the new one appears.
    if (previous) await expect(page.locator('main h3')).toHaveCount(1)
    if (previous) await expect(page.locator('main h3')).not.toHaveText(previous)
    const prompt = plain(await page.locator('main h3').first().innerText())
    previous = await page.locator('main h3').first().innerText()
    const q = practice.find((x) => plain(x.prompt) === prompt)
    expect(q, `question with prompt "${prompt}"`).toBeTruthy()
    await answer(page.locator('main'), q!)
    await page.getByRole('button', { name: i === practice.length - 1 ? 'See results' : 'Next question' }).click()
  }
  await expect(page.getByText('Passed. Review is unlocked.')).toBeVisible()
  await expect(page.getByLabel(`${dnsCards.length} cards due`)).toBeVisible()

  // Daily review: flip and rate one card.
  await page.goto('/review')
  await expect(page.getByRole('button', { name: /Show answer/ })).toBeVisible()
  await page.keyboard.press('Space')
  await expect(page.getByText('How well did you remember it?')).toBeVisible()
  await page.keyboard.press('3')
  // A new card rated Good returns in 10 minutes, so it is re-queued for this session.
  await expect(page.getByText(`1 done · ${dnsCards.length} left`)).toBeVisible()

  // Progress survives a reload.
  await page.reload()
  await expect(page.getByLabel(`${dnsCards.length - 1} cards due`)).toBeVisible()
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Caching', level: 1 })).toBeVisible()

  // Backup: export, erase, import.
  await page.goto('/settings')
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export progress' }).click()])
  const file = await download.path()
  const data = JSON.parse(await readFile(file, 'utf8'))
  expect(data.app).toBe('system-design-study-plan')
  expect(data.tables.reviewCards).toHaveLength(dnsCards.length)

  await page.getByLabel('Type erase to confirm').fill('erase')
  await page.getByRole('button', { name: 'Erase all progress' }).click()
  await expect(page.getByText('All progress erased.')).toBeVisible()
  await expect(page.getByLabel(/cards due/)).toHaveCount(0)

  await page.getByLabel('Choose a backup file').setInputFiles(file)
  await page.getByRole('button', { name: 'Replace progress' }).click()
  await expect(page.getByText(/Imported progress for \d+ concepts and 9 flashcards/)).toBeVisible()
  await expect(page.getByLabel(`${dnsCards.length - 1} cards due`)).toBeVisible()
})

test('every page renders without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  for (const path of ['/', '/roadmap', '/c/caching/gate', '/c/caching/learn', '/c/cdn', '/review', '/mistakes', '/settings', '/nope']) {
    await page.goto(path)
    await expect(page.locator('main')).not.toBeEmpty()
  }
  // Locked steps explain why instead of showing content.
  await page.goto('/c/caching/practice')
  await expect(page.getByText('This step is locked')).toBeVisible()
  // Search finds concepts and terms.
  await page.keyboard.press('Control+k')
  await page.getByLabel('Search concepts and terms').fill('stampede')
  await expect(page.getByRole('option').first()).toContainText('Cache stampede')
  expect(errors).toEqual([])
})
