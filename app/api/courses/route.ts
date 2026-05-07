import { NextResponse } from 'next/server'
import { getAll } from '@/lib/db'

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
    return NextResponse.json({ error: '강의 목록을 불러오지 못했어요.' }, { status: 500 })
  }
}
