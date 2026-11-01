import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = InterviewSetuService.getAISession(id)

  if (!session) {
    return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })
  }

  // If not completed yet, complete it now
  if (!session.report) {
    InterviewSetuService.completeAISession(id)
  }

  return NextResponse.json({
    success: true,
    data: {
      sessionId: session.id,
      trackTitle: session.trackTitle,
      mode: session.mode,
      durationMinutes: session.durationMinutes,
      scoreOverall: session.scoreOverall,
      completedAt: session.completedAt,
      report: session.report,
    },
  })
}
