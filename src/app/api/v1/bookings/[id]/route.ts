import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const booking = InterviewSetuService.getBookingById(id)

  if (!booking) {
    return NextResponse.json(
      { success: false, error: `Booking '${id}' not found` },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: booking,
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  if (body.status) {
    const updated = InterviewSetuService.updateBookingStatus(id, body.status, body.actor || 'API Client')
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: updated })
  }

  if (body.feedback) {
    const updated = InterviewSetuService.submitMentorFeedback(id, body.feedback)
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: updated })
  }

  return NextResponse.json({ success: false, error: 'No valid action provided' }, { status: 400 })
}
