import ChatBot from '@/components/chatbot';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import React from 'react';

const Home = async () => {
  const profile = await currentProfile();
  if (!profile) {
    redirect('/edit');
  } else {
    const user = await db.profile.findUnique({
      where: {
        userId: profile.userId,
      },
    });

    return <ChatBot user={user} />;
  }
};

export default Home;
