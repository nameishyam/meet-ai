"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useMeetingStore } from "@/stores/meeting-store";
import { getUser } from "@/lib/auth";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Loader2, Send, MessageSquare, X } from "lucide-react";
import { ChatMessage, User } from "@/lib/types";

function ChatSidebar({
  messages,
  currentMessage,
  setCurrentMessage,
  handleSendMessage,
  isAiResponding,
  onClose,
}: {
  messages: ChatMessage[];
  currentMessage: string;
  setCurrentMessage: (msg: string) => void;
  handleSendMessage: () => void;
  isAiResponding: boolean;
  onClose: () => void;
}) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo(0, scrollAreaRef.current.scrollHeight);
    }
  }, [messages]);

  return (
    <aside className="fixed right-0 top-0 w-96 h-full bg-neutral-950 flex flex-col border-l border-neutral-700 z-50">
      <div className="flex items-center justify-between p-4 border-b border-neutral-700">
        <h3 className="font-semibold text-lg text-white">Interview Chat</h3>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-800 text-neutral-100"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isAiResponding && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-neutral-800 text-neutral-100">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4 border-t border-neutral-700 flex flex-col gap-2">
        <Textarea
          placeholder="Type your response..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          rows={3}
          disabled={isAiResponding}
          className="bg-neutral-900 text-white border-neutral-700 resize-none"
        />
        <Button
          onClick={handleSendMessage}
          disabled={isAiResponding}
          className="w-full"
        >
          {isAiResponding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send
        </Button>
      </div>
    </aside>
  );
}

// --- Custom Call Controls ---
function CustomCallControls({
  onToggleChat,
  onHangUp,
}: {
  onToggleChat: () => void;
  onHangUp: () => void;
}) {
  return (
    <div className="str-video__call-controls">
      <CallControls onLeave={onHangUp} />
      <button
        className="str-video__call-controls__button"
        onClick={onToggleChat}
        title="Toggle Chat"
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    </div>
  );
}

// --- Main Interview Component ---
export default function InterviewPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const { meetingId } = use(params);
  const router = useRouter();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Stream Video Client & Call
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);

  const { initialQuestion, clearMeetingDetails } = useMeetingStore();

  // Initialize Stream Video Client
  useEffect(() => {
    const user = getUser() as User;
    if (!user || !user.id) {
      toast.error("You must be logged in.");
      router.push("/login");
      return;
    }

    const initializeStream = async () => {
      try {
        // Get Stream token from your backend
        const tokenResponse = await fetch("/api/stream/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id.toString() }),
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to get Stream token");
        }

        const { token, apiKey } = await tokenResponse.json();

        // Create Stream Video Client
        const streamClient = new StreamVideoClient({
          apiKey: apiKey,
          user: {
            id: user.id.toString(),
            name: user.name || "User",
          },
          token: token,
        });

        setClient(streamClient);
      } catch (error) {
        console.error("Stream initialization error:", error);
        toast.error("Failed to initialize video call");
        router.push("/dashboard");
      }
    };

    initializeStream();

    return () => {
      setClient(null);
    };
  }, [meetingId, router]);

  // Join/Create Call
  useEffect(() => {
    if (!client) return;

    const joinCall = async () => {
      try {
        const streamCall = client.call("default", meetingId);
        await streamCall.join({ create: true });
        setCall(streamCall);
      } catch (err) {
        console.error("Failed to join the call", err);
        toast.error("Failed to join the call");
      }
    };

    joinCall();

    return () => {
      setCall(undefined);
      call?.leave().catch((err: Error) => {
        console.error("Failed to leave the call", err);
      });
    };
  }, [client, meetingId]);

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      const user = getUser();
      if (!user) return;

      setIsLoading(true);

      if (initialQuestion) {
        // First load from dashboard
        setMessages([{ role: "assistant", content: initialQuestion }]);
      } else {
        // Page refresh - load existing chat
        try {
          const response = await fetch("/api/session/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ meetingId: parseInt(meetingId) }),
          });

          if (!response.ok) {
            toast.error("You do not have permission for this interview.");
            router.push("/dashboard");
            return;
          }

          const data = await response.json();
          setMessages(data.timestamps || []);
        } catch (err) {
          console.error("Failed to load chat history:", err);
          toast.error("Failed to load chat history.");
        }
      }

      setIsLoading(false);
    };

    loadChatHistory();
  }, [meetingId, initialQuestion, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      client?.disconnectUser();
      clearMeetingDetails();
    };
  }, [client, clearMeetingDetails]);

  // Chat Handler
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isAiResponding) return;

    setIsAiResponding(true);
    const newUserMessage: ChatMessage = {
      role: "user",
      content: currentMessage,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setCurrentMessage("");

    try {
      const response = await fetch("/api/session/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId: parseInt(meetingId),
          message: newUserMessage.content,
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const data = await response.json();
      const newAiMessage: ChatMessage = {
        role: "assistant",
        content: data.aiResponse,
      };
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Error connecting to AI. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleHangUp = async () => {
    try {
      await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: parseInt(meetingId) }),
      });
      toast.success("Interview ended. Redirecting...");
      router.push("/dashboard");
    } catch (error) {
      console.error("Hang up error:", error);
      toast.error("Failed to end interview properly");
      router.push("/dashboard");
    }
  };

  if (isLoading || !client || !call) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900 text-white">
        <Loader2 className="animate-spin h-12 w-12" />
        <p className="ml-4 text-lg">Loading secure interview...</p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamTheme className="interview-theme">
        <StreamCall call={call}>
          <div className="flex h-screen w-full bg-neutral-900 relative">
            <Toaster theme="dark" />

            {/* Main Video Area */}
            <div className={`flex-1 ${isChatOpen ? "mr-96" : ""}`}>
              <SpeakerLayout />

              {/* Custom Controls Overlay */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                <CustomCallControls
                  onToggleChat={() => setIsChatOpen(!isChatOpen)}
                  onHangUp={handleHangUp}
                />
              </div>
            </div>

            {/* Chat Sidebar */}
            {isChatOpen && (
              <ChatSidebar
                messages={messages}
                currentMessage={currentMessage}
                setCurrentMessage={setCurrentMessage}
                handleSendMessage={handleSendMessage}
                isAiResponding={isAiResponding}
                onClose={() => setIsChatOpen(false)}
              />
            )}
          </div>
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}
