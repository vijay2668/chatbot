'use client';

import { useRef, useState, useEffect } from 'react';
import styles from '@/styles/Home.module.css';
import { Message } from '@/lib/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/LoadingDots';
import { Document } from 'langchain/document';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import axios from 'axios';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';
import OpenAI from 'openai';
import { createThread, getAssistants } from '@/lib/OpenAI';
import { Combobox } from './ui/combo-box';

export default function ChatBot({ user }: any) {
  const [assistants, setAssistants] = useState([]);
  const [openai, setOpenai] = useState<any>(null);
  const [currentChatbot, setCurrentChatbot] = useState<any>(null);
  const [currentThread, setCurrentThread] = useState<any>(null);

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

  useEffect(() => {
    const createFirstThread = async () => {
      const thread = await createThread(openai);
      setCurrentThread(thread);
    };
    createFirstThread();
  }, [openai]);

  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<any>([]);

  useEffect(() => {
    setMessages([
      {
        message: `👋 Hello there! Welcome to our ${currentChatbot?.name}!`,
        role: 'bot',
      },
    ]);
  }, [currentChatbot?.name]);

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessages((prevChats: any) => [
      ...prevChats,
      {
        role: 'user',
        message: question,
      },
    ]);

    setLoading(true);
    setQuery('');

    try {
      const response = await axios.post('/api/chat', {
        question,
        assistant: currentChatbot,
        openAIAPIkey: user?.openAIAPIkey,
        currentThread: currentThread,
      });
      const data = await response.data;
      // console.log('data', data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessages((prevChats: any) => [
          ...prevChats,
          {
            role: 'bot',
            message: data.content[0].text.value,
          },
        ]);
      }

      setLoading(false);

      //scroll to bottom
      messageListRef?.current?.scrollTo(
        0,
        messageListRef?.current?.scrollHeight,
      );
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <>
      <div className="mx-auto flex flex-col w-full h-full space-y-4">
        <header className="sticky top-0 z-40 bg-white">
          <div className="h-16 left-0 px-8 border-b flex items-center justify-between border-b-slate-200 py-4">
            <nav className="">
              <Link
                href="/edit"
                className="hover:text-slate-600 cursor-pointer"
              >
                Edit
              </Link>
            </nav>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>
        <div>
          <main className="flex flex-col items-center w-full flex-1 overflow-hidden">
            <Combobox
              chatbots={assistants}
              setCurrentChatbot={setCurrentChatbot}
            />
            <div className="flex flex-col justify-between items-center w-full h-full py-4">
              <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
                Chat With Your Docs
              </h1>
              <main className={styles.main}>
                <div className={styles.cloud}>
                  <div ref={messageListRef} className={styles.messagelist}>
                    {messages.map((message: any, index: number) => {
                      let icon;
                      let className;
                      if (message.role === 'bot') {
                        icon = (
                          <Image
                            key={index}
                            src="/bot-image.png"
                            alt="AI"
                            width="40"
                            height="40"
                            className={styles.boticon}
                            priority
                          />
                        );
                        className = styles.apimessage;
                      } else {
                        icon = (
                          <Image
                            key={index}
                            src="/usericon.png"
                            alt="Me"
                            width="30"
                            height="30"
                            className={styles.usericon}
                            priority
                          />
                        );
                        // The latest message sent by the user will be animated while waiting for a response
                        className =
                          loading && index === messages.length - 1
                            ? styles.usermessagewaiting
                            : styles.usermessage;
                      }
                      return (
                        <>
                          <div
                            key={`chatMessage-${index}`}
                            className={className}
                          >
                            {icon}
                            <div className={styles.markdownanswer}>
                              <ReactMarkdown>{message.message}</ReactMarkdown>
                            </div>
                          </div>
                          {/* {message.sourceDocs && (
                            <div
                              className="p-5"
                              key={`sourceDocsAccordion-${index}`}
                            >
                              <Accordion
                                type="single"
                                collapsible
                                className="flex-col"
                              >
                                {message.sourceDocs.map((doc, index) => (
                                  <div key={`messageSourceDocs-${index}`}>
                                    <AccordionItem value={`item-${index}`}>
                                      <AccordionTrigger>
                                        <h3>Source {index + 1}</h3>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <ReactMarkdown>
                                          {doc.pageContent}
                                        </ReactMarkdown>
                                        <p className="mt-2">
                                          <b>Source:</b> {doc.metadata.source}
                                        </p>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </div>
                                ))}
                              </Accordion>
                            </div>
                          )} */}
                        </>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.center}>
                  <div className={styles.cloudform}>
                    <form onSubmit={handleSubmit}>
                      <textarea
                        disabled={loading}
                        onKeyDown={handleEnter}
                        ref={textAreaRef}
                        autoFocus={false}
                        rows={1}
                        maxLength={512}
                        id="userInput"
                        name="userInput"
                        placeholder={
                          loading ? 'Waiting for response...' : 'Ask'
                        }
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className={styles.textarea}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className={styles.generatebutton}
                      >
                        {loading ? (
                          <div className={styles.loadingwheel}>
                            <LoadingDots color="#000" />
                          </div>
                        ) : (
                          // Send icon SVG in input field
                          <svg
                            viewBox="0 0 20 20"
                            className={styles.svgicon}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                          </svg>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
                {error && (
                  <div className="border border-red-400 rounded-md p-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}
              </main>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
