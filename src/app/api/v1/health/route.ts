import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'InterviewSetu Platform API',
    version: '1.0.0',
    capabilities: {
      aiInterviewEngine: true,
      speechRecognition: 'WebRTC / Web Speech / STT-TTS chained',
      paymentAdapter: 'Razorpay Test Sandbox',
      liveKitRooms: 'Enabled (WebRTC ephemeral tokens)',
      verificationQueue: 'Active',
    },
  })
}
