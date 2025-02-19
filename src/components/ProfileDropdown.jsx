// src/components/ProfileDropdown.jsx

import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileDropdown({ hamburgerMode = false }) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSigningOut(true);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };


  useEffect(() => {
    if (signingOut) {
      router.push("/signin");
    }
  }, [signingOut, router]);

  const getInitials = (name) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';
  };

  if (hamburgerMode) {
    return null;
  }
  

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <Button
  variant="ghost"
  className="relative h-10 w-10 md:mt-2 rounded-full" // Adjusted size
>
  <Avatar className="h-10 w-10"> 
    <AvatarImage src={currentUser?.photoURL} alt={currentUser?.displayName} />
    <AvatarFallback className="text-base bg-gray-600 text-white">
      {getInitials(currentUser?.displayName)}
    </AvatarFallback>
  </Avatar>
</Button>

      
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-2 w-56 dark:bg-zinc-800" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none dark:text-gray-100">
              {currentUser?.displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="dark:text-gray-100 cursor-pointer" onClick={() => router.push('/settings')}>
            Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="dark:text-gray-100 cursor-pointer">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}