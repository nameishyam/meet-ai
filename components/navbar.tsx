"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeAuth } from "@/lib/auth";

interface NavbarProps {
  isLoggedIn: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  return (
    <div className="w-full h-16 flex items-center justify-between px-4 border-b">
      <button
        className="text-xl font-bold hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none p-0"
        onClick={() => {
          window.location.href = "/";
        }}
      >
        Meet AI
      </button>
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (isLoggedIn) {
                      removeAuth();
                      window.location.href = "/login";
                    }
                  }}
                >
                  Logout
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  Dashboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = "/signup")}
              className="hover: cursor-pointer"
            >
              Sign Up
            </Button>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="hover: cursor-pointer"
            >
              Login
            </Button>
          </>
        )}
        <ModeToggle />
      </div>
    </div>
  );
}
