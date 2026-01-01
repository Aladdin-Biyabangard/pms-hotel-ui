import {useEffect, useState} from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {useNavigate} from "react-router-dom";
import {BedDouble, Calendar, Hotel, Receipt, Users} from "lucide-react";

interface SearchResult {
  id: number;
  type: "guest" | "room" | "hotel" | "invoice";
  title: string;
  subtitle?: string;
  route: string;
}

interface GlobalSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GlobalSearch({open, onOpenChange}: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    // Mock search - replace with actual API call
    const mockResults: SearchResult[] = [
      {
        id: 2,
        type: "guest",
        title: searchQuery,
        subtitle: "Guest Profile",
        route: `/guests/2`,
      },
      {
        id: 3,
        type: "room",
        title: `Room ${searchQuery}`,
        subtitle: "Standard Double",
        route: `/rooms/3`,
      },
    ];

    setResults(mockResults);
  }, [searchQuery]);

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "guest":
        return Users;
      case "room":
        return BedDouble;
      case "hotel":
        return Hotel;
      case "invoice":
        return Receipt;
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.route);
    onOpenChange?.(false);
    setSearchQuery("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search guests, rooms, hotels..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((result) => {
              const Icon = getIcon(result.type);
              return (
                <CommandItem
                  key={result.id}
                  value={result.title}
                  onSelect={() => handleSelect(result)}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">{result.title}</span>
                    {result.subtitle && (
                      <span className="text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

// Hook for keyboard shortcut (Ctrl+K / Cmd+K)
export function useGlobalSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return {open, setOpen};
}

