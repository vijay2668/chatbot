import EditPage from '@/components/edit';
import { currentProfile } from '@/lib/current-profile';
import { initPinecone } from '@/lib/pinecone-client';
import React from 'react';

const dashboard = async () => {
  const profile = await currentProfile();

  return <EditPage user={profile} />;
};

export default dashboard;
