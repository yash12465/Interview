import { NextRequest, NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const track = InterviewSetuService.getTrackBySlug(slug)

  if (!track) {
    return NextResponse.json(
      { success: false, error: `Track with slug '${slug}' not found` },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: track,
  })
}
