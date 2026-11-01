import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const role = (searchParams.get('role') as 'candidate' | 'interviewer' | 'admin') || 'candidate'
  const userId = searchParams.get('userId') || undefined

  const bookings = InterviewSetuService.getBookings(userId, role)

  return NextResponse.json({
    success: true,
    count: bookings.length,
    data: bookings,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.mentorId || !body.scheduledDate || !body.scheduledTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking parameters: mentorId, scheduledDate, scheduledTime' },
        { status: 400 }
      )
    }

    const booking = InterviewSetuService.createBooking({
      candidateId: body.candidateId || 'usr-cand-1',
      candidateName: body.candidateName || 'Aarav Kumar',
      mentorId: body.mentorId,
      trackTitle: body.trackTitle || 'Software Engineering',
      serviceName: body.serviceName || 'Technical Mock & Project Defence',
      scheduledDate: body.scheduledDate,
      scheduledTime: body.scheduledTime,
      durationMinutes: body.durationMinutes || 45,
      pricePaise: body.pricePaise || 119900,
      brief: body.brief || {
        targetRole: 'Software Engineer',
        focusArea: 'Project Defence',
        notes: '',
        consentToShare: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: booking,
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
