import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { currentProfile } from '@/lib/current-profile';
import OpenAI from 'openai';
import { UploadFile, createAssistant } from '@/lib/OpenAI';

export async function POST(req: Request) {
  const profile = await currentProfile();

  try {
    if (!profile) return new NextResponse('Unauthorized', { status: 401 });

    const {
      websiteURL,
      websiteURLs,
      chatbotName,
      chatbotInstructions,
      openAIAPIkey,
    } = await req.json();

    console.log('openAIAPIkey', openAIAPIkey);

    const openai = new OpenAI({
      apiKey: openAIAPIkey,
    });

    if (websiteURLs.length === 0) {
      return new NextResponse('website urls not found', {
        status: 400,
      });
    }

    // got all sublinks
    console.log('step 1:', websiteURLs);

    let BACKEND_URL = process.env.BACKEND_URL;

    if (!BACKEND_URL) {
      return new NextResponse('Backend url not found', {
        status: 400,
      });
    }

    // sending sublinks and openai API key for generating fileIDs of all links
    const res = await axios.post(BACKEND_URL, {
      openAIAPIkey: openAIAPIkey,
      websiteURLs: websiteURLs,
    });

    // got all fileIDs from backend
    let fileIDs: string[] = res?.data;

    console.log('step 2:', fileIDs);

    const assistant = await createAssistant({
      chatbotName,
      chatbotInstructions,
      fileIDs,
      openai,
    });

    console.log('step 3:', assistant);

    const response = await db.profile.update({
      where: { id: profile.id },
      data: {
        openAIAPIkey: openAIAPIkey,
      },
    });

    console.log('step 5:', response);
    return NextResponse.json({ response: response, assistant: assistant });
  } catch (error: any) {
    console.log('error', error);
    return new NextResponse('Something went wrong', { status: 500 });
  }
}
