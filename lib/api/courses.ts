import { apiClient } from './client'
import type { Course } from '@/lib/schemas/enrollment'

export type CourseListResponse = {
  courses: Course[]
  categories: string[]
}

export async function fetchCourses(category?: string): Promise<CourseListResponse> {
  const searchParams = category ? { category } : undefined
  return apiClient.get('/api/courses', { searchParams }).json()
}
