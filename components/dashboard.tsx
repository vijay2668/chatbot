'use client';
import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import { Delete, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { fileRetrieve, getAssistants } from '@/lib/OpenAI';
import OpenAI from 'openai';
import { useModal } from '@/hooks/use-modal-store';

export const DashboardPage = ({ user }: any) => {
  const [assistants, setAssistants] = useState([]);
  const [openai, setOpenai] = useState<any>(null);
  const { onOpen } = useModal();

  useEffect(() => {
    if (user?.openAIAPIkey) {
      const fetchOpenAIAPIKey = () => {
        const openai: any = new OpenAI({
          apiKey: user?.openAIAPIkey,
          dangerouslyAllowBrowser: true,
        });
        setOpenai(openai);
      };
      fetchOpenAIAPIKey();
    }
  }, [user?.openAIAPIkey]);

  useEffect(() => {
    if (openai) {
      const fetchAssistant = async () => {
        const chatbots = await getAssistants(openai);
        setAssistants(chatbots);
      };
      fetchAssistant();
    }
  }, [openai]);

  const handleDelete = async (assistant: any) => {
    try {
      if (!openai) return null;

      const response = await axios.post('/api/deleteAssistant', {
        openAIAPIkey: openai?.apiKey,
        assistantID: assistant?.id,
      });

      const data = response.data;
      if (data.deleted) {
        const filterAssistant = assistants.filter(
          (assistant: any) => assistant.id !== data.id,
        );
        setAssistants(filterAssistant);
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  const fetchFileDetails = async (assistant: any) => {
    const getFile = await fileRetrieve(assistant?.file_ids?.[0], openai);
    return getFile;
  };

  const handle = async (assistant: any) => {
    const file = await fetchFileDetails(assistant);

    if (file?.filename === "upload") {
      onOpen('editWebsite', assistant);
    } else {
      onOpen('editFile', assistant);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <ScrollArea className="h-full w-48 ml-2 my-2 rounded-md border">
        <div className="p-4">
          <h4 className="text-sm font-medium leading-none">
            Your Created Bots
          </h4>
          <Separator className="my-2" />
          {assistants?.map((assistant: any) => (
            <div key={assistant.id} className="flex flex-col w-full">
              <div className="text-sm w-full flex items-center justify-between">
                {assistant.name}
                <div className="flex items-center space-x-2">
                  <Edit
                    onClick={() => handle(assistant)}
                    className="cursor-pointer"
                    width={18}
                    height={18}
                  />
                  <Delete
                    onClick={() => handleDelete(assistant)}
                    className="cursor-pointer"
                    width={18}
                    height={18}
                  />
                </div>
              </div>
              <Separator className="my-2" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
