import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  
  // Forward to ML Backend
  const mlResponse = await fetch('http://127.0.0.1:8000/anti-cheat', {
    method: 'POST',
    body: formData
  });
  
  const analysis = await mlResponse.json();
  return NextResponse.json(analysis);
}
