"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileSystemProvider } from "@/lib/contexts/file-system-context";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { FileTree } from "@/components/editor/FileTree";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeaderActions } from "@/components/HeaderActions";

interface MainContentProps {
  user?: {
    id: string;
    email: string;
  } | null;
  project?: {
    id: string;
    name: string;
    messages: any[];
    data: any;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function MainContent({ user }: MainContentProps) {
  const [activeView, setActiveView] = useState<"preview" | "code">("preview");

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div
        className="h-14 flex-shrink-0 flex items-center justify-between px-6"
        style={{ background: "#1a3d2b" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
            style={{ background: "#E8722A" }}
          >
            N
          </div>
          <span className="text-white font-semibold text-base tracking-tight">
            Neato Component Studio
          </span>
        </div>
        <HeaderActions user={user} projectId={undefined} />
      </div>

      {/* Main workspace */}
      <FileSystemProvider>
        <ChatProvider model="claude-sonnet-4-6">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Left: Chat */}
            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <div className="h-full bg-white border-r border-neutral-200">
                <ChatInterface />
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-[1px] bg-neutral-200 hover:bg-neutral-300 transition-colors" />

            {/* Right: Preview / Code */}
            <ResizablePanel defaultSize={65}>
              <div className="h-full flex flex-col">
                <div className="h-10 border-b border-neutral-200/60 px-4 flex items-center bg-neutral-50/50 flex-shrink-0">
                  <Tabs
                    value={activeView}
                    onValueChange={(v) => setActiveView(v as "preview" | "code")}
                  >
                    <TabsList className="bg-white/60 border border-neutral-200/60 p-0.5 h-7 shadow-sm">
                      <TabsTrigger
                        value="preview"
                        className="data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-500 px-3 py-1 text-xs font-medium transition-all"
                      >
                        Preview
                      </TabsTrigger>
                      <TabsTrigger
                        value="code"
                        className="data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-500 px-3 py-1 text-xs font-medium transition-all"
                      >
                        Code
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex-1 overflow-hidden">
                  {activeView === "preview" ? (
                    <div className="h-full bg-white">
                      <PreviewFrame />
                    </div>
                  ) : (
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                      <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                        <div className="h-full bg-neutral-50 border-r border-neutral-200">
                          <FileTree />
                        </div>
                      </ResizablePanel>
                      <ResizableHandle className="w-[1px] bg-neutral-200 hover:bg-neutral-300 transition-colors" />
                      <ResizablePanel defaultSize={70}>
                        <div className="h-full bg-white">
                          <CodeEditor />
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ChatProvider>
      </FileSystemProvider>
    </div>
  );
}
