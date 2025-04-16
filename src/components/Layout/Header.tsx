
import { useState } from 'react';
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="flex h-16 items-center px-6 border-b bg-white dark:bg-slate-900">
      <div className="flex-1 flex items-center">
        <form className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search cases, documents..." 
            className="pl-10 bg-muted/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-law-amber rounded-full"></span>
        </Button>
        <div className="h-6 w-px bg-border"></div>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span>Account</span>
        </Button>
      </div>
    </header>
  );
}
