"use client";

import { useKBar } from "kbar";
import { Search } from "lucide-react";
import { Button } from "./ui/button";

export default function SearchButton() {
  const { query } = useKBar();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => query.toggle()}
      className="gap-2"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden sm:inline pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
