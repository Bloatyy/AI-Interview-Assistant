import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { user_id, company, role } = await request.json();
  
  // Logic to fetch questions from DynamoDB or local dataset
  const questions = [
    { id: 1, text: "Tell me about yourself.", type: "intro" },
    { id: 2, text: "Describe a challenge you faced.", type: "behavioral" }
  ];

  return NextResponse.json({ 
    interview_id: "int_" + Math.random().toString(36).substr(2, 9),
    questions 
  });
}
