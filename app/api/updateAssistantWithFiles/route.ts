import { UploadFile, createAssistant, modifyAssistant } from '@/lib/OpenAI';
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
    const file_ids: any = formData.getAll('file_ids');

    const assistantId: any = formData.get('assistantId');
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

    
    const assistant = await modifyAssistant({
      assistantId,
      chatbotName,
      chatbotInstructions,
      fileIDs: file_ids ? [...fileIDs, ...file_ids] : fileIDs,
      openai,
    });
    
    console.log('fileIDs', file_ids ? [...fileIDs, ...file_ids] : fileIDs);
    console.log('updated assistant', assistant);
    
    return NextResponse.json(assistant);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
