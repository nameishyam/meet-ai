"use client";

import MeetingsList from "@/components/meetings-list";
import { getUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/client-wrapper";
import { User } from "@/lib/types";
import AddMeeting from "@/components/add-meeting";

export default function DashboardPage() {
  const { isLoggedIn } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to access the dashboard.");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } else {
      const userData = getUser();
      setUser(userData as User);
      setIsClient(true);
    }
  }, [isLoggedIn]);

  if (!isClient || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full">
      <div className="flex h-full">
        <aside
          className="flex-none w-[320px] min-w-[200px] 
                     bg-muted/50 border-r"
        >
          <MeetingsList user={user} />
        </aside>
        <main className="flex-1 min-w-0">
          <div className="p-4">
            <AddMeeting userId={user.id as number} />
          </div>
        </main>
      </div>
    </div>
  );
}
