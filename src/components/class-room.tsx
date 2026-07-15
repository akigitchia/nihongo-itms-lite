"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatPanel } from "@/components/chat-panel";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export function ClassRoom({ session, profile, isTeacher }: { session: any; profile: any; isTeacher: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const router = useRouter();
  const [materialsLink, setMaterialsLink] = useState(session.materials_link ?? "");

  // Nếu giáo viên không nhập link riêng (Zoom/Teams/Meet), dùng phòng Jitsi Meet miễn phí,
  // đặt tên phòng cố định theo session id để cả 2 bên luôn vào chung 1 phòng.
  const usesJitsi = !session.meeting_link || session.meeting_link.includes("jit.si");
  const jitsiRoom = `NihongoITMS-${session.id}`;

  useEffect(() => {
    // ghi nhận điểm danh khi học viên vào lớp
    if (!isTeacher) {
      fetch(`/api/attendance/${session.id}`, { method: "POST" }).catch(() => {});
    }
    return () => {
      if (!isTeacher) {
        fetch(`/api/attendance/${session.id}`, { method: "PATCH" }).catch(() => {});
      }
    };
  }, [session.id, isTeacher]);

  useEffect(() => {
    if (!usesJitsi) return; // dùng external link (Zoom/Teams/Meet) — không nhúng iframe
    const domain = process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si";
    const scriptId = "jitsi-external-api";

    function mount() {
      if (!containerRef.current || apiRef.current) return;
      apiRef.current = new window.JitsiMeetExternalAPI(domain, {
        roomName: jitsiRoom,
        parentNode: containerRef.current,
        userInfo: { displayName: profile.full_name },
        configOverwrite: { prejoinPageEnabled: true },
        interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false },
      });
    }

    if (window.JitsiMeetExternalAPI) {
      mount();
    } else if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://${domain}/external_api.js`;
      script.async = true;
      script.onload = mount;
      document.body.appendChild(script);
    }

    return () => {
      apiRef.current?.dispose?.();
      apiRef.current = null;
    };
  }, [usesJitsi, jitsiRoom, profile.full_name]);

  async function saveMaterials() {
    await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates: { materials_link: materialsLink } }),
    });
  }

  function leaveClass() {
    if (!isTeacher) fetch(`/api/attendance/${session.id}`, { method: "PATCH" }).catch(() => {});
    apiRef.current?.executeCommand?.("hangup");
    router.push("/dashboard");
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-sumi-100 bg-white px-4 py-3">
          <div>
            <p className="text-xs text-sumi-400">{session.course?.title} · Buổi {session.session_number}</p>
            <h1 className="text-base font-semibold text-sumi-900">Live Classroom</h1>
          </div>
          <Button size="sm" variant="danger" onClick={leaveClass}>
            <LogOut className="h-4 w-4" /> Rời lớp
          </Button>
        </div>

        {/* Materials link — giáo viên tự chuẩn bị tài liệu trên máy và present qua share-screen
            trong buổi học; ở đây chỉ lưu link tham khảo (Google Drive/OneDrive...) để học viên xem trước/sau. */}
        <div className="flex items-center gap-2 border-b border-sumi-100 bg-sumi-50/60 px-4 py-2">
          <FileText className="h-4 w-4 shrink-0 text-sumi-400" />
          {isTeacher ? (
            <>
              <Input
                className="h-8 flex-1 bg-white text-xs"
                placeholder="Dán link tài liệu buổi học (Google Drive, OneDrive...)"
                value={materialsLink}
                onChange={(e) => setMaterialsLink(e.target.value)}
                onBlur={saveMaterials}
              />
            </>
          ) : materialsLink ? (
            <a href={materialsLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-navy-700 hover:underline">
              Xem tài liệu buổi học <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-xs text-sumi-400">Giáo viên chưa chia sẻ tài liệu cho buổi này.</span>
          )}
        </div>

        <div className="flex-1 bg-sumi-900">
          {usesJitsi ? (
            <div ref={containerRef} className="h-full w-full" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-white">
              <p className="max-w-sm text-sm text-sumi-100/80">
                Buổi học này dùng link video call riêng (Zoom/Teams/Google Meet). Bấm nút bên dưới để mở.
              </p>
              <a href={session.meeting_link} target="_blank" rel="noreferrer">
                <Button size="lg" variant="secondary">
                  Mở link video call <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="h-72 shrink-0 border-t border-sumi-100 lg:h-auto lg:w-80 lg:border-l lg:border-t-0">
        <ChatPanel courseId={session.course_id} currentUserId={profile.id} />
      </div>
    </div>
  );
}
