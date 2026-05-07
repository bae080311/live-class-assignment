import 'server-only'
import fs from 'fs'
import path from 'path'
import type { Course } from '@/lib/schemas/enrollment'

// JSON file database for development/demo. NOT thread-safe for concurrent writes.

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

export type { Course }

export type Enrollment = {
  id: string
  enrollmentId: string
  status: 'confirmed' | 'pending'
  enrolledAt: string
  courseId: string
  type: 'personal' | 'group'
  applicant: {
    name: string
    email: string
    phone: string
    motivation?: string
  }
  group?: {
    organizationName: string
    headCount: number
    participants: { name: string; email: string }[]
    contactPerson: string
  }
  agreedToTerms: boolean
  createdAt: string
}

export type DbSchema = {
  courses: Course[]
  enrollments: Enrollment[]
}

function readDb(): DbSchema {
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(raw) as DbSchema
}

function writeDb(data: DbSchema): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export function getAll<K extends keyof DbSchema>(entity: K): DbSchema[K] {
  return readDb()[entity]
}

export function getById<K extends keyof DbSchema>(
  entity: K,
  id: string
): DbSchema[K][number] | undefined {
  const items = readDb()[entity] as Array<{ id: string }>
  return items.find(item => item.id === id) as DbSchema[K][number] | undefined
}

export function create<K extends keyof DbSchema>(
  entity: K,
  item: Omit<DbSchema[K][number], 'id' | 'createdAt'>
): DbSchema[K][number] {
  const db = readDb()
  const newItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  } as DbSchema[K][number]
  ;(db[entity] as Array<DbSchema[K][number]>).push(newItem)
  writeDb(db)
  return newItem
}

export function update<K extends keyof DbSchema>(
  entity: K,
  id: string,
  patch: Partial<DbSchema[K][number]>
): DbSchema[K][number] | undefined {
  const db = readDb()
  const items = db[entity] as Array<DbSchema[K][number] & { id: string }>
  const index = items.findIndex(item => item.id === id)
  if (index === -1) return undefined
  items[index] = { ...items[index], ...patch }
  writeDb(db)
  return items[index]
}

export function remove<K extends keyof DbSchema>(entity: K, id: string): boolean {
  const db = readDb()
  const items = db[entity] as Array<{ id: string }>
  const index = items.findIndex(item => item.id === id)
  if (index === -1) return false
  items.splice(index, 1)
  writeDb(db)
  return true
}

export function transaction<T>(fn: (db: DbSchema) => T): T {
  const db = readDb()
  const result = fn(db)
  writeDb(db)
  return result
}
