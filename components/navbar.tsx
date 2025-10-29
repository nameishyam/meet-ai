"use client";

import { Button } from "@/components/ui/button";
import { removeAuth } from "@/lib/auth";
import { toast } from "sonner";
import { ModeToggle } from "./theme-toggle";

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
          <Button
            className="hover:bg-red-600 dark:hover:bg-red-500 hover:cursor-pointer"
            onClick={() => {
              if (isLoggedIn) {
                removeAuth();
                window.location.href = "/login";
              } else {
                toast.error("You are not logged in");
              }
            }}
          >
            Logout
          </Button>
        ) : (
          <Button
            onClick={() => (window.location.href = "/login")}
            className="hover: cursor-pointer"
          >
            Login
          </Button>
        )}
        <ModeToggle />
      </div>
    </div>
  );
}
