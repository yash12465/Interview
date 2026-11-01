import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || undefined
  const tracks = InterviewSetuService.getTracks(category)

  return NextResponse.json({
    success: true,
    count: tracks.length,
    data: tracks,
  })
}
