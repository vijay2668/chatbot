
import { ModalProvider } from '@/components/modal-provider';
import { currentProfile } from '@/lib/current-profile';
import React from 'react';

const dashboard = async () => {
  const profile = await currentProfile();
  
  return <ModalProvider user={profile}/>;
};

export default dashboard;
