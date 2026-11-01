import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.sessionId || !body.answerText) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId or answerText' },
        { status: 400 }
      )
    }

    const result = InterviewSetuService.submitAITurn(body.sessionId, body.answerText)
    if (!result) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })
    }

    if (result.isComplete) {
      InterviewSetuService.completeAISession(body.sessionId)
    }

    return NextResponse.json({
      success: true,
      data: {
        candidateTurn: result.candTurn,
        interviewerTurn: result.aiTurn,
        isComplete: result.isComplete,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
