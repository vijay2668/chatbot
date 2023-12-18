//create assistants
export const createAssistant = async ({
  chatbotName,
  chatbotInstructions,
  fileIDs,
  openai,
}: any) => {
  const assistant = await openai.beta.assistants.create({
    name: chatbotName,
    instructions:
      !chatbotInstructions || chatbotInstructions === ''
        ? 'You are a good assistant'
        : chatbotInstructions,
    tools: [{ type: 'retrieval' }],
    model: 'gpt-3.5-turbo-1106',
    file_ids: fileIDs.map((fileID: any) => fileID),
  });

  return assistant;
};

export const modifyAssistant = async ({
  assistantId,
  chatbotName,
  chatbotInstructions,
  fileIDs,
  openai,
}: any) => {
  const assistant = await openai.beta.assistants.update(assistantId, {
    name: chatbotName,
    instructions: chatbotInstructions,
    tools: [{ type: 'retrieval' }],
    model: 'gpt-3.5-turbo-1106',
    file_ids: fileIDs.map((fileID: any) => fileID),
  });

  return assistant;
};

//run assistants
export const runAssistant = async ({
  assistantId,
  threadId,
  instructions,
  openai,
}: any) => {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    instructions: instructions,
  });
  return run;
};

//get thread
export const getAssistants = async (openai: any) => {
  const assistants: any = await openai.beta.assistants.list({
    order: 'desc',
  });

  return assistants.data;
};

//delete assistant
export const deleteAssistant = async (openai: any, assistantID: string) => {
  const response = await openai.beta.assistants.del(assistantID);
  return response;
};

//check on the run thread
export const runCheck = async ({ threadId, runId, openai }: any) => {
  const check = await openai.beta.threads.runs.retrieve(threadId, runId);
  return check;
};

//create thread
export const createThread = async (openai: any) => {
  const thread = await openai?.beta?.threads?.create();
  return thread;
};

//get thread
export const getThread = async (threadId: string, openai: any) => {
  const thread = await openai.beta.threads.retrieve(threadId);
  return thread;
};

//delete thread
export const deleteThread = async (threadId: string, openai: any) => {
  const response = await openai.beta.threads.del(threadId);
  return response;
};

//create message
export const createMessage = async ({ threadId, content, openai }: any) => {
  const messages = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: content,
  });
  return messages;
};

//get messages
export const getMessages = async (threadId: string, openai: any) => {
  const messages = await openai.beta.threads.messages.list(threadId);
  return messages;
};

// Upload a file with an "assistants" purpose

export const UploadFile = async (fileSrc: any, openai: any) => {
  const file = await openai.files.create({
    file: fileSrc,
    purpose: 'assistants',
  });
  return file;
};

export const fileRetrieve = async (fileID: any, openai: any) => {
  const file = await openai?.files?.retrieve(fileID);
  return file;
};
