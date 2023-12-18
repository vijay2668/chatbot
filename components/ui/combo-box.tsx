import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function Combobox({ chatbots, setCurrentChatbot }: any) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [assistants, setAssistants] = useState<any>([]);

  useEffect(() => {
    if (chatbots) {
      const newAssistants = chatbots.map((chatbot: any) => ({
        label: chatbot?.name,
        value: chatbot?.name, // Use name as value, assuming it's unique
      }));
      setAssistants(newAssistants);
      setValue(newAssistants[0]?.value);
    }
  }, [chatbots]);

  useEffect(() => {
    setCurrentChatbot(chatbots?.find((chatbot: any) => chatbot?.name === value));
  }, [chatbots, setCurrentChatbot, value]);

  const handleCurrent = (value: string) => {
    const find = assistants?.find((assistant: any) => value === assistant?.value)?.label;
    return find || 'Select Assistant...';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {handleCurrent(value)}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {assistants?.map((assistant: any) => (
              <CommandItem
                key={assistant?.value}
                value={assistant?.value}
                onSelect={() => {
                  setValue(assistant?.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === assistant.value ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {assistant.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
