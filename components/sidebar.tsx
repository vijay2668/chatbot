'use client';
import { useModal } from '@/hooks/use-modal-store';
import { UserButton } from '@clerk/nextjs';
import { ScrollArea } from './ui/scroll-area';
import { NavigationItem } from './navigation-item';
import { File, Webhook } from 'lucide-react';

export const Sidebar = () => {
  const { onOpen } = useModal();

  const items = [
    {
      label: 'File',
      openName: 'file',
      icon: <File width={20} height={20} />,
    },
    {
      label: 'Website',
      openName: 'website',
      icon: <Webhook width={20} height={20} />,
    },
  ];

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3">
      <ScrollArea className="flex-1 w-full">
        <div className="space-y-2">
          {items?.map((item, index) => (
            <NavigationItem
              key={index}
              label={item.label}
              icon={item.icon}
              openName={item.openName}
              onOpen={onOpen}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'h-[48px] w-[48px]',
            },
          }}
        />
      </div>
    </div>
  );
};
