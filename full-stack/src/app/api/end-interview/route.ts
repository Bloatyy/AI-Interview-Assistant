import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { interview_id } = await request.json();

  // 1. Aggregate scores
  // 2. Generate final report
  // 3. Trigger email via Brevo
  
  return NextResponse.json({ 
    status: "success",
    report_url: `/report/${interview_id}`
  });
}
