"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
}

const DataTableSearch = ({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 800,
  disabled = false,
}: DataTableSearchProps) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    if (inputValue === value) return;

    const timeoutId = window.setTimeout(() => onChange(inputValue), debounceMs);
    return () => window.clearTimeout(timeoutId);
  }, [debounceMs, inputValue, onChange, value]);

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className="relative w-full max-w-sm">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="text"
        value={inputValue}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => setInputValue(event.target.value)}
        className="pr-9 pl-9"
      />
      {inputValue && (
        <button
          type="button"
          aria-label="Clear search"
          title="Clear search"
          disabled={disabled}
          onClick={handleClear}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default DataTableSearch;