'use client';

import { FileIcon, X } from 'lucide-react';
import Image from 'next/image';

import { UploadDropzone } from '@/lib/uploadthing';

import '@uploadthing/react/styles.css';

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: any;
  endpoint: 'pdfFile';
}

export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
  if (value.length > 0) {
    return (
      <div className="flex flex-col space-y-2 h-20 overflow-y-scroll overflow-x-hidden">
        {value?.map((item: any, index: any) => {
          const { url } = item;
          return (
            <div
              key={index}
              className="relative flex items-center p-2 rounded-md bg-background/10"
            >
              <div>
                <FileIcon className="h-5 w-5 fill-indigo-200 stroke-indigo-400" />
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                {url}
              </a>
              <button
                onClick={() => onChange('')}
                className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res: any) => {
        onChange(res);
      }}
      onUploadError={(error: Error) => {
        console.log(error);
      }}
    />
  );
};
