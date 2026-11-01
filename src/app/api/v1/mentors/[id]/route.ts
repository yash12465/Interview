import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const mentor = InterviewSetuService.getMentorById(id)

  if (!mentor) {
    return NextResponse.json(
      { success: false, error: `Mentor with id '${id}' not found` },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: mentor,
  })
}
