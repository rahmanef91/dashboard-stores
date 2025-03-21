"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WidgetSearchProps {
  onSearch: (query: string) => void;
}

const WidgetSearch: React.FC<WidgetSearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from local storage on mount
  useEffect(() => {
    const storedSearches = localStorage.getItem("recent-widget-searches");
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches));
      } catch (e) {
        console.error("Failed to parse stored searches", e);
      }
    }
  }, []);

  // Save recent searches to local storage when they change
  useEffect(() => {
    localStorage.setItem(
      "recent-widget-searches",
      JSON.stringify(recentSearches),
    );
  }, [recentSearches]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      // Add to recent searches if not already there
      if (!recentSearches.includes(query)) {
        const newSearches = [query, ...recentSearches.slice(0, 4)];
        setRecentSearches(newSearches);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
    onSearch(search);
  };

  const removeRecentSearch = (search: string) => {
    const newSearches = recentSearches.filter((s) => s !== search);
    setRecentSearches(newSearches);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search widgets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {recentSearches.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-muted-foreground mb-1">
            Recent searches:
          </div>
          <div className="flex flex-wrap gap-1">
            {recentSearches.map((search, index) => (
              <div
                key={index}
                className="flex items-center bg-muted rounded-full px-3 py-1 text-xs"
              >
                <button
                  className="mr-1"
                  onClick={() => handleRecentSearch(search)}
                >
                  {search}
                </button>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => removeRecentSearch(search)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetSearch;
