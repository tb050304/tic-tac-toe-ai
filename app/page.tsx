"use client";
import { useState } from "react";
// 1. 引入刚才拆分出去的组件
import Board from "../components/Board";
import ChatBox from "../components/ChatBox";
import { calculateWinner } from "@/lib/gameLogic";
import { Message } from "@/types";

export default function Home() {
  // --- 状态管理 (State) ---
  const [squares, setSquares] = useState<(string | null)[]>(
    Array(9).fill(null),
  );
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "愚蠢的人类，想挑战我？先让你一步。" },
  ]);
  const [loading, setLoading] = useState(false);

  // --- 逻辑判断 (Logic) ---
  const winner = calculateWinner(squares);

  // --- 事件处理 (Handlers) ---
  async function handleClick(i: number) {
    if (squares[i] || winner || loading) return;

    const newSquares = [...squares];
    newSquares[i] = "X";
    setSquares(newSquares);

    if (calculateWinner(newSquares) || !newSquares.includes(null)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/taunt", {
        method: "POST",
        body: JSON.stringify({
          board: newSquares,
          history: messages,
          userMove: i,
        }),
      });
      const data = await res.json();

      if (data.move !== undefined) {
        const aiSquares = [...newSquares];
        aiSquares[data.move] = "O";
        setSquares(aiSquares);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.taunt },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "网络断了，你是不是输不起拔我网线？" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleReset = () => {
    setSquares(Array(9).fill(null));
    setMessages([
      { role: "assistant", content: "重来？哪怕重来一万次你也是输。" },
    ]);
  };

  // --- 渲染界面 (Render) ---
  return (
    <main className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* 左侧：棋盘区 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-black mb-8 text-cyan-400">
          DEEPSEEK CHESS v1.0
        </h1>

        {/* 使用拆分后的 Board 组件 */}
        <Board squares={squares} onClick={handleClick} loading={loading} />

        <button
          onClick={handleReset}
          className="mt-10 opacity-30 hover:opacity-100 transition-opacity uppercase text-xs tracking-widest"
        >
          Reset Game
        </button>
      </div>

      {/* 右侧：聊天沙盒区 */}
      <div className="w-full max-w-sm bg-slate-900 flex flex-col border-l border-slate-800 shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="font-black text-xl text-rose-500 tracking-tighter italic">
            AI TAUNT BOX
          </h2>
        </div>

        {/* 使用拆分后的 ChatBox 组件 */}
        <ChatBox messages={messages} loading={loading} />
      </div>
    </main>
  );
}
