import type { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/lib/makechain';
import { NextResponse } from 'next/server';
import { currentProfile } from '@/lib/current-profile';
import {
  createMessage,
  createThread,
  getMessages,
  runAssistant,
  runCheck,
} from '@/lib/OpenAI';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const profile = await currentProfile();

  const { currentThread, question, assistant, openAIAPIkey } = await req.json();

  //only accept post requests
  if (!profile) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!question) {
    return new NextResponse('No question in the request', { status: 400 });
  }

  if (!openAIAPIkey) {
    return new NextResponse('OpenAI api key is missing', { status: 402 });
  }

  if (!assistant) {
    return new NextResponse('Current Assistant is missing', { status: 402 });
  }

  if (!currentThread) {
    return new NextResponse('Thread id is missing', { status: 402 });
  }

  const openai = new OpenAI({
    apiKey: openAIAPIkey,
  });

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    const userMessage = await createMessage({
      threadId: currentThread.id,
      content: sanitizedQuestion,
      openai,
    });

    console.log('userMessage', userMessage);

    const run = await runAssistant({
      assistantId: assistant.id,
      threadId: currentThread.id,
      instructions: assistant.instructions,
      openai,
    });

    let runStatus = await runCheck({
      threadId: currentThread.id,
      runId: run.id,
      openai,
    });

    while (runStatus.status !== 'completed') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      runStatus = await runCheck({
        threadId: currentThread.id,
        runId: run.id,
        openai,
      });
      console.log(runStatus)
    }

    // unable to get all messages
    const messages = await getMessages(currentThread.id, openai);

    const lastMessageForRun = messages.data
      .filter(
        (message: any) =>
          message.run_id === run.id && message.role === 'assistant',
      )
      .pop();

    console.log(lastMessageForRun)

    return NextResponse.json(lastMessageForRun);
  } catch (error: any) {
    console.log('error', error);
    return new NextResponse('Something went wrong', { status: 500 });
  }
}
