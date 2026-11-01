import { NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET() {
  const logs = InterviewSetuService.getAuditLogs()
  return NextResponse.json({
    success: true,
    count: logs.length,
    data: logs,
  })
}
