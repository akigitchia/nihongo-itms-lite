"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatTimeVi } from "@/lib/utils";
import type { Message } from "@/lib/types";

export function ChatPanel({ courseId, currentUserId }: { courseId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<(Message & { sender_name?: string })[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadInitial() {
      const { data } = await supabase
        .from("messages")
        .select("*, sender:profiles(full_name)")
        .eq("course_id", courseId)
        .order("created_at", { ascending: true })
        .limit(100);
      setMessages((data ?? []).map((m: any) => ({ ...m, sender_name: m.sender?.full_name })));
    }
    loadInitial();

    const channel = supabase
      .channel(`messages-${courseId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `course_id=eq.${courseId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage() {
    if (!text.trim()) return;
    const supabase = createClient();
    const content = text.trim();
    setText("");
    await supabase.from("messages").insert({ course_id: courseId, sender_id: currentUserId, content });
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-sumi-100 px-3 py-2 text-sm font-semibold text-sumi-900">Chat lớp học</div>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-2">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`max-w-[85%] rounded-lg px-3 py-1.5 text-sm ${mine ? "ml-auto bg-navy-700 text-white" : "bg-sumi-50 text-sumi-900"}`}>
              {!mine && <p className="text-[10px] font-medium opacity-70">{m.sender_name ?? "Ẩn danh"}</p>}
              <p>{m.content}</p>
              <p className={`mt-0.5 text-[10px] ${mine ? "text-white/60" : "text-sumi-400"}`}>{formatTimeVi(m.created_at)}</p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-sumi-100 p-2">
        <input
          className="h-9 flex-1 rounded-lg border border-sumi-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button size="sm" onClick={sendMessage}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
