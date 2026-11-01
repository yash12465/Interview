import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET() {
  const applications = InterviewSetuService.getAdminApplications()
  return NextResponse.json({
    success: true,
    count: applications.length,
    data: applications,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.userId || !body.action) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or action (approve | reject | needs_info)' },
        { status: 400 }
      )
    }

    const updated = InterviewSetuService.reviewInterviewerApplication(
      body.userId,
      body.action,
      body.reason || 'Admin review completed.',
      body.reviewer || 'Super Admin'
    )

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Interviewer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Application status updated to ${updated.interviewerProfile?.verificationStatus}`,
      data: updated,
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
