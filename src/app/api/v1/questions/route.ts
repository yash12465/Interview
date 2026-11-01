import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const trackSlug = searchParams.get('trackSlug') || undefined
  const difficulty = searchParams.get('difficulty') || undefined
  const search = searchParams.get('search') || undefined

  const questions = InterviewSetuService.getQuestions({ trackSlug, difficulty, search })

  return NextResponse.json({
    success: true,
    count: questions.length,
    data: questions,
  })
}
