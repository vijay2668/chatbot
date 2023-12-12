import type { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/lib/makechain';
import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

async function initPinecone({ botAPI, botEnvironment }: any) {
  try {
    const pinecone = new Pinecone({
      environment: botEnvironment, //this is in the dashboard
      apiKey: botAPI,
    });

    return pinecone;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to initialize Pinecone Client');
  }
}

export async function POST(req: Request) {
  const { question, history, botName, botAPI, botEnvironment } =
    await req.json();

  console.log('question', question);
  console.log('history', history);

  //only accept post requests
  if (req.method !== 'POST') {
    return new NextResponse('method not allowed', { status: 405 });
  }

  if (!question) {
    return new NextResponse('No question in the request', { status: 400 });
  }

  if (!botName || botName === '') {
    return new NextResponse('bot name is missing', { status: 402 });
  }

  if (!botAPI || botAPI === '') {
    return new NextResponse('bot api is missing', { status: 402 });
  }
  if (!botEnvironment || botEnvironment === '') {
    return new NextResponse('bot environment is missing', { status: 402 });
  }

  const pinecone = await initPinecone({ botAPI, botEnvironment });
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    const index = pinecone.Index(botName);

    /* create vectorstore*/
    console.log('index', index);
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        // namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
      },
    );

    console.log('vectorStore', vectorStore);
    // Use a callback to get intermediate sources from the middle of the chain
    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });
    const retriever = vectorStore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            resolveWithDocuments(documents);
          },
        },
      ],
    });

    //create chain
    const chain = makeChain(retriever);

    const pastMessages = history
      .map((message: [string, string]) => {
        return [`Human: ${message[0]}`, `Assistant: ${message[1]}`].join('\n');
      })
      .join('\n');
    console.log(pastMessages);

    console.log('pass');

    //Ask a question using chat history
    const response = await chain.invoke({
      question: sanitizedQuestion,
      chat_history: pastMessages,
    });

    const sourceDocuments = await documentPromise;

    console.log('response', response);

    return NextResponse.json({ text: response, sourceDocuments });
  } catch (error: any) {
    console.log('error', error);
    return new NextResponse('Something went wrong', { status: 500 });
  }
}
