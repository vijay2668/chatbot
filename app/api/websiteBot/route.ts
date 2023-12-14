import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { NextResponse } from 'next/server';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  const { userId } = auth();
  const {
    websiteURL,
    websiteURLs,
    pineconeAPI,
    pineconeEnvironment,
    pineconeIndexName,
  } = await req.json();

  try {
    if (!userId) {
      return new NextResponse('userId not found', { status: 401 });
    }
    if (!pineconeAPI || pineconeAPI === '') {
      return new NextResponse('pinecone api key not found', { status: 402 });
    }

    if (!pineconeEnvironment || pineconeEnvironment === '') {
      return new NextResponse('pinecone environment not found', {
        status: 402,
      });
    }

    if (!pineconeIndexName || pineconeIndexName === '') {
      return new NextResponse('pinecone index name not found', {
        status: 402,
      });
    }

    if (!websiteURL || websiteURL === '') {
      return new NextResponse('website url not found', {
        status: 402,
      });
    }

    if (websiteURLs.length === 0) {
      return new NextResponse('website urls not found', {
        status: 402,
      });
    }

    // here start operation*
    let docs: any = [];

    for (const site of websiteURLs) {
      try {
        const response = await axios.get(site);
        const html = response.data;
        const $ = cheerio.load(html);

        const content = $.text();

        const textWithoutTags = content.replace(/<[^>]+>/g, '');
        const textWithoutStyles = textWithoutTags.replace(/style="[^"]+"/g, '');
        const cleanText = textWithoutStyles.replace(/\s+/g, ' ');

        const metadata = {
          source: site,
        };

        docs.push({ pageContent: cleanText, metadata });
      } catch (error) {
        console.error('Error loading sublink:', error);
      }
    }

    // console.log(docs);
    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docsChunks = await textSplitter.splitDocuments(docs);
    console.log('split docs', docsChunks);

    const embeddings = new OpenAIEmbeddings();

    const pinecone = new Pinecone({
      apiKey: pineconeAPI,
      environment: pineconeEnvironment,
    });

    await pinecone.createIndex({
      name: pineconeIndexName,
      dimension: 1536,
      metric: 'cosine',
    });

    const index = pinecone.Index(pineconeIndexName); //change to your own index name

    //embed the PDF documents
    await PineconeStore.fromDocuments(docsChunks, embeddings, {
      pineconeIndex: index,
      // namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });

    const array: any = [];
    for (let site of websiteURLs) {
      array.push(site);
    }

    const res = await db.profile.create({
      data: {
        userId: userId,
        botAPI: pineconeAPI,
        botEnvironment: pineconeEnvironment,
        botName: pineconeIndexName,
        botFiles: array.join(', '),
      },
    });

    return NextResponse.json(res);
  } catch (error: any) {
    console.log('error', error);
    return new NextResponse('Something went wrong', { status: 500 });
  }
}
