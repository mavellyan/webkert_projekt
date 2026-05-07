import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.resolve(__dirname, '../data/db.json')

let writeQueue = Promise.resolve()

export async function readDb() {
  const raw = await fs.readFile(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

export async function writeDb(nextDb) {
  writeQueue = writeQueue.then(() =>
    fs.writeFile(DB_PATH, JSON.stringify(nextDb, null, 2), 'utf-8')
  )

  await writeQueue
}

export function newId(prefix) {
  const random = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}${random}`
}

export function nowIso() {
  return new Date().toISOString()
}
