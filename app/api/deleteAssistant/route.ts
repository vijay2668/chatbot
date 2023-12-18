import { deleteAssistant } from '@/lib/OpenAI';
import { currentProfile } from '@/lib/current-profile';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { openAIAPIkey, assistantID } = await req.json();

    const openai = new OpenAI({
      apiKey: openAIAPIkey,
    });

    if (!openai) {
      return new NextResponse('Open AI API is missing', { status: 400 });
    }

    const assistant = await deleteAssistant(openai, assistantID);

    return NextResponse.json(assistant);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
