import { NextResponse } from 'next/server'
import { InterviewSetuService } from '@/lib/services/interviewsetu-service'

export async function GET() {
  const metrics = InterviewSetuService.getAdminMetrics()
  const applications = InterviewSetuService.getAdminApplications()
  const auditLogs = InterviewSetuService.getAuditLogs().slice(0, 10)

  return NextResponse.json({
    success: true,
    data: {
      metrics,
      applicationsSummary: applications,
      recentAuditLogs: auditLogs,
    },
  })
}
