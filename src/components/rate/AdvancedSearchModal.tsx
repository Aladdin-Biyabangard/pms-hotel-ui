import React, {useEffect, useState} from 'react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {Button} from '@/components/ui/button';
import {Loader2, Search} from 'lucide-react';

// Common interface for items that can be searched
export interface SearchableItem {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

// Props for the AdvancedSearchModal component
export interface AdvancedSearchModalProps<T extends SearchableItem> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  placeholder: string;
  items: T[];
  onSelect: (item: T) => void;
  isLoading?: boolean;
  onSearch?: (query: string) => void | Promise<void>;
  emptyMessage?: string;
  disabled?: boolean;
}

// SearchButton component for triggering the advanced search
export interface SearchButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const SearchButton: React.FC<SearchButtonProps> = ({
  onClick,
  disabled = false,
  children = 'Advanced Search'
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="shrink-0"
    >
      <Search className="h-4 w-4 mr-1" />
      {children}
    </Button>
  );
};

// Main AdvancedSearchModal component
export const AdvancedSearchModal = <T extends SearchableItem>({
  open,
  onOpenChange,
  title,
  placeholder,
  items,
  onSelect,
  isLoading = false,
  onSearch,
  emptyMessage = "No items found.",
  disabled = false,
}: AdvancedSearchModalProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search query changes
  useEffect(() => {
    if (onSearch && searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        onSearch(searchQuery);
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, onSearch]);

  // Reset search query when modal opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
    }
  }, [open]);

  const handleSelect = (item: T) => {
    onSelect(item);
    onOpenChange(false);
    setSearchQuery('');
  };

  const displayName = (item: T) => {
    if (item.code) {
      return `${item.name} (${item.code})`;
    }
    return item.name;
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={placeholder}
        value={searchQuery}
        onValueChange={setSearchQuery}
        disabled={disabled}
      />
      <CommandList>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Searching...</span>
          </div>
        ) : (
          <>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup heading={title}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.name} ${item.code || ''} ${item.description || ''}`}
                  onSelect={() => handleSelect(item)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{displayName(item)}</span>
                    {item.description && (
                      <span className="text-sm text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};