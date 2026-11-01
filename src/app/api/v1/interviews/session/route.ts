import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const session = InterviewSetuService.createAISession({
      candidateId: body.candidateId || 'usr-cand-1',
      trackTitle: body.trackTitle || 'Software Engineering',
      mode: body.mode || 'Realistic Mock',
      topic: body.topic || 'Project explanation & architecture trade-offs',
      durationMinutes: body.durationMinutes || 20,
    })

    return NextResponse.json({
      success: true,
      data: session,
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
