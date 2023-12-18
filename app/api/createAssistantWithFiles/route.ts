import { UploadFile, createAssistant } from '@/lib/OpenAI';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();

    const files: any = formData.getAll('files');
    const chatbotName: any = formData.get('chatbotName');
    const chatbotInstructions: any = formData.get('chatbotInstructions');
    const openAIAPIkey: any = formData.get('openAIAPIkey');

    console.log('openAIAPIkey', openAIAPIkey);

    const openai = new OpenAI({
      apiKey: openAIAPIkey,
    });

    let fileIDs: any = [];

    for (let file of files) {
      const res = await UploadFile(file, openai);
      fileIDs.push(res.id);
    }

    console.log('fileIDs', fileIDs);
    const assistant = await createAssistant({
      chatbotName,
      chatbotInstructions,
      fileIDs,
      openai,
    });

    console.log('assistant', assistant);
    const response = await db.profile.update({
      where: { id: profile.id },
      data: {
        openAIAPIkey: openAIAPIkey,
      },
    });

    console.log('response', response);
    return NextResponse.json({ response: response, assistant: assistant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
