import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { NextResponse } from 'next/server';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';

export async function POST(req: Request) {
  const { userId } = auth();
  const {
    fileUrls,
    pineconeAPI,
    pineconeEnvironment,
    pineconeIndexName,
    Update,
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

    if (!Update) {
      return new NextResponse('Update is false', {
        status: 402,
      });
    }

    let mergedDocs: any = [];
    for (let pdf of fileUrls) {
      // Fetch PDF content from the URL
      const response = await fetch(pdf?.url);
      const pdfBytes = await response.arrayBuffer();
      // console.log('pdfBytes', pdfBytes);

      // Convert ArrayBuffer to Blob
      const pdfBlob = new Blob([pdfBytes]);

      // // Use the PDFLoader to load the PDF from the Blob
      const pdfLoader = new PDFLoader(pdfBlob);
      const rawDocs = await pdfLoader.load();

      mergedDocs.push(...rawDocs);
    }

    console.log('rawDocs', mergedDocs);

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(mergedDocs);
    console.log('split docs', docs);

    // console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();

    const pinecone = new Pinecone({
      apiKey: pineconeAPI,
      environment: pineconeEnvironment,
    });

    const index = pinecone.Index(pineconeIndexName); //change to your own index name

    // embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      // namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });

    const array: any = [];
    for (let fileUrl of fileUrls) {
      array.push(fileUrl?.url);
    }

    const res = await db.profile.update({
      where: {
        userId: userId,
      },
      data: {
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
