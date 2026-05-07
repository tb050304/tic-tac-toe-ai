"use client";
import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [squares, setSquares] = useState<(string | null)[]>(
    Array(9).fill(null),
  );
  // 核心：对话历史状态
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "愚蠢的人类，想挑战我？先让你一步。" },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到聊天底部
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const calculateWinner = (sq: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return sq[a];
    }
    return null;
  };

  const winner = calculateWinner(squares);

  async function handleClick(i: number) {
    if (squares[i] || winner || loading) return;

    // 1. 玩家下棋
    const newSquares = [...squares];
    newSquares[i] = "X";
    setSquares(newSquares);

    // 总是调用AI，让它回复，即使游戏结束
    setLoading(true);
    try {
      // 2. 发送请求，带上当前棋盘和历史对话
      const res = await fetch("/api/taunt", {
        method: "POST",
        body: JSON.stringify({
          board: newSquares,
          history: messages,
          userMove: i,
        }),
      });
      const data = await res.json();

      // 3. 更新棋盘和消息列表
      // 只有当游戏还没结束时，才让AI下棋
      const gameEnded =
        calculateWinner(newSquares) || !newSquares.includes(null);
      if (data.move !== undefined && !gameEnded) {
        const aiSquares = [...newSquares];
        aiSquares[data.move] = "O";
        setSquares(aiSquares);
      }

      // 把 AI 的新嘲讽加入历史
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.taunt },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* 左侧：棋盘区 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="grid grid-cols-3 gap-3">
          {squares.map((v, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className="w-20 h-20 md:w-28 md:h-28 bg-slate-800 hover:bg-slate-700 text-4xl font-bold rounded-2xl flex items-center justify-center transition-all shadow-xl"
            >
              <span className={v === "X" ? "text-cyan-400" : "text-rose-500"}>
                {v}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 右侧：聊天沙盒区 */}
      <div className="w-full max-w-sm bg-slate-900 flex flex-col border-l border-slate-800 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-black text-xl text-rose-500 tracking-tighter">
            AI TAUNT BOX
          </h2>
          <button
            onClick={() => {
              setSquares(Array(9).fill(null));
              setMessages([
                {
                  role: "assistant",
                  content: "重来？哪怕重来一万次你也是输。",
                },
              ]);
            }}
            className="text-xs text-slate-500 hover:text-white uppercase"
          >
            Reset
          </button>
        </div>

        {/* 气泡列表 */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === "assistant"
                    ? "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                    : "bg-rose-600 text-white rounded-tr-none shadow-lg shadow-rose-900/20"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-slate-500 animate-pulse italic">
              AI 正在斟酌如何喷你...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
