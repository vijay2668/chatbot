import { create } from 'zustand';

export type ModalType = 'file'| 'editFile' | 'website' | 'editWebsite';

interface Assistant {
  created_at: number;
  description: null;
  file_ids: string[];
  id: string;
  instructions: string;
  metadata: any;
  model: string;
  name: string;
  object: string;
  tools: any;
}

interface ModalData {
  assistant?: Assistant;
}

interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  data: any;
  onOpen: (type: ModalType) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false }),
}));
