"use client";
import { useState } from "react";

export default function Home() {
  const [squares, setSquares] = useState<(string | null)[]>(
    Array(9).fill(null),
  );
  const [taunt, setTaunt] = useState("快点，别让我等太久。");
  const [loading, setLoading] = useState(false);

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
    // 轮到玩家走，如果格子有子或有人赢了，不执行
    if (squares[i] || winner || loading) return;

    // 1. 玩家落子 (X)
    const newSquares = [...squares];
    newSquares[i] = "X";
    setSquares(newSquares);

    if (calculateWinner(newSquares) || !newSquares.includes(null)) {
      setTaunt("游戏结束了，虽然结果早已注定。");
      return;
    }

    // 2. 呼叫 AI 决定下一步
    setLoading(true);
    try {
      const res = await fetch("/api/taunt", {
        method: "POST",
        body: JSON.stringify({ board: newSquares }),
      });
      const data = await res.json();

      // 3. AI 落子 (O) 并更新嘲讽
      const aiSquares = [...newSquares];
      if (data.move !== undefined) {
        aiSquares[data.move] = "O";
        setSquares(aiSquares);
      }
      setTaunt(data.taunt);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen bg-slate-950 text-white">
      {/* 棋盘区 */}
      <div className="flex-1 flex flex-col items-center justify-center border-r border-slate-800">
        <h1 className="text-3xl font-black mb-8 text-cyan-400">
          AI 嘲讽对弈局
        </h1>
        <div className="grid grid-cols-3 gap-3">
          {squares.map((v, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className="w-24 h-24 bg-slate-800 hover:bg-slate-700 text-4xl font-bold rounded-xl flex items-center justify-center transition-all"
            >
              <span className={v === "X" ? "text-cyan-400" : "text-rose-500"}>
                {v}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setSquares(Array(9).fill(null))}
          className="mt-10 opacity-50 hover:opacity-100"
        >
          清空
        </button>
      </div>

      {/* 嘲讽区 */}
      <div className="w-80 p-8 bg-slate-900">
        <h2 className="text-xl font-bold mb-4">毒舌 AI 对手</h2>
        <div
          className={`p-4 rounded-xl bg-slate-800 border-l-4 border-rose-500 italic ${loading ? "animate-pulse" : ""}`}
        >
          “{taunt}”
        </div>
      </div>
    </main>
  );
}
