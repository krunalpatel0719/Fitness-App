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
import { Settings, LogOut, User } from "lucide-react";

export function ProfileDropdown({ hamburgerMode = false }) {
  const { currentUser, userProfile } = useAuth();
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
          className="relative h-8 w-8 rounded-full border-0 hover:bg-transparent focus:ring-0 focus:ring-offset-0"
        >
          <Avatar className="h-8 w-8 transition-transform hover:scale-105">
            <AvatarImage 
              src={userProfile?.photoURL} 
              alt={userProfile?.displayName} 
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
              {getInitials(userProfile?.displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 mt-1 p-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg"
        align="end"
      >
        <DropdownMenuLabel className="px-2 py-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {userProfile?.displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {userProfile?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-zinc-700" />
       
        <DropdownMenuItem 
          className="flex items-center px-2 py-2 text-sm text-gray-700 dark:text-gray-200 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md cursor-pointer"
          onClick={() => router.push('/settings')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-zinc-700" />
        <DropdownMenuItem 
  className="flex items-center px-2 py-2 text-sm text-red-400 rounded-md cursor-pointer
             hover:bg-red-50 dark:hover:bg-red-400/20 hover:text-red-400 dark:hover:text-red-400
             focus:bg-red-50 focus:text-red-400 dark:focus:bg-red-400/20 dark:focus:text-red-400"
  onClick={handleSignOut}
>
  <LogOut className="w-4 h-4 mr-2" />
  Sign out
</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}