"use client";
import { useEffect, useRef } from "react";
import { Message } from "@/types";

export default function ChatBox({
  messages,
  loading,
}: {
  messages: Message[];
  loading: boolean;
}) {
  // 创建一个引用，用于直接操作 DOM 元素（聊天容器）
  const scrollRef = useRef<HTMLDivElement>(null);

  // 副作用钩子：当 messages 数组变化时（即有新消息），自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      // 将滚动条位置设为容器的总高度，实现自动触底
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    // ref={scrollRef} 将此 div 与上面的 scrollRef 绑定
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((m, idx) => (
        <div
          key={idx}
          // 根据角色决定对齐方向：AI 靠左，用户靠右
          className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}
        >
          <div
            // 动态样式：根据发送者角色切换颜色、圆角和边框
            className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
              m.role === "assistant"
                ? "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700" // AI 消息样式
                : "bg-rose-600 text-white rounded-tr-none shadow-lg" // 用户消息样式
            }`}
          >
            {m.content}
          </div>
        </div>
      ))}
      {/* 加载状态提示 */}
      {loading && (
        <div className="text-xs text-slate-500 animate-pulse italic">
          AI 正在斟酌如何喷你...
        </div>
      )}
    </div>
  );
}
