import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('domain') || undefined
  const mentors = InterviewSetuService.getMentors(domain)

  return NextResponse.json({
    success: true,
    count: mentors.length,
    data: mentors,
  })
}
