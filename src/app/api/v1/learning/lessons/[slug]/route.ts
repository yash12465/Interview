import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const lesson = InterviewSetuService.getLessonBySlug(slug)

  if (!lesson) {
    return NextResponse.json(
      { success: false, error: `Lesson with slug '${slug}' not found` },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: lesson,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const lesson = InterviewSetuService.getLessonBySlug(slug)
  if (!lesson) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))
  const progress = body.progressPercent ?? 100
  const updated = InterviewSetuService.updateLessonProgress(lesson.id, progress)

  return NextResponse.json({
    success: true,
    data: updated,
  })
}
