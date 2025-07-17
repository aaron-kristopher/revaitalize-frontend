import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import React from "react";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react";


interface ComboboxProps {
  comboBoxValues: { value: string; label: string }[];
  category: string
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

export const DatasetInfoCombobox: React.FC<ComboboxProps> = ({ comboBoxValues, category, value, setValue }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (

    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? comboBoxValues.find((propValue) => propValue.value === value)?.label
            : `Select ${category}...`}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search exercise..." />
          <CommandList>
            <CommandEmpty>No `${category}` found.</CommandEmpty>
            <CommandGroup>
              {comboBoxValues.map((propValue) => (
                <CommandItem
                  key={propValue.value}
                  value={propValue.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === propValue.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {propValue.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

