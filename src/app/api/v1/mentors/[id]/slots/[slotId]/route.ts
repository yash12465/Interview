import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; slotId: string }> }
) {
  try {
    const { id, slotId } = await params
    const res = await fetch(`${BACKEND_URL}/api/v1/mentors/${id}/slots/${slotId}`, {
      method: 'DELETE',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
