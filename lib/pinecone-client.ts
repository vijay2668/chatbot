import { Pinecone } from '@pinecone-database/pinecone';

async function initPinecone({ environment, apiKey }: any) {
  try {
    const pinecone = new Pinecone({
      environment: environment || '',
      apiKey: apiKey || '',
    });

    return pinecone;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to initialize Pinecone Client');
  }
}

export { initPinecone }; // Export the function so that it can be used in other files
