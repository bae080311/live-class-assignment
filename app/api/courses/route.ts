import 'server-only'
import { NextResponse } from 'next/server'
import { getAll } from '@/lib/db'
import { ERROR_CODES } from '@/lib/schemas/enrollment'

const CATEGORIES = ['development', 'design', 'marketing', 'business']

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let courses = getAll('courses')
    if (category && CATEGORIES.includes(category)) {
      courses = courses.filter(c => c.category === category)
    }

    return NextResponse.json({ courses, categories: CATEGORIES })
  } catch {
    return NextResponse.json(
      { code: ERROR_CODES.SERVER_ERROR, message: '강의 목록을 불러오지 못했어요.' },
      { status: 500 }
    )
  }
}
