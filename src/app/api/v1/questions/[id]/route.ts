import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const question = InterviewSetuService.getQuestionById(id)

  if (!question) {
    return NextResponse.json(
      { success: false, error: `Question with id '${id}' not found` },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: question,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const isSaved = InterviewSetuService.toggleSaveQuestion(id)

  return NextResponse.json({
    success: true,
    id,
    isSaved,
  })
}
