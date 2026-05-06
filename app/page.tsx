"use client"; // 必须声明，否则不能使用 useState 钩子

import { useState } from "react";

/**
 * 胜负判定纯函数 (Pure Function)
 * 逻辑：穷举 8 种获胜组合，检查棋盘数组
 */
function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // 横向
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // 纵向
    [0, 4, 8],
    [2, 4, 6], // 对角线
  ];
  for (let [a, b, c] of lines) {
    // 如果三个格子的值相同且不为空，返回获胜者 ('X' 或 'O')
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default function Home() {
  // --- 状态管理 (对应 Vue 的 ref/reactive) ---
  // squares: 存储 9 个格子的值; setSquares: 修改它的唯一方法
  const [squares, setSquares] = useState<(string | null)[]>(
    Array(9).fill(null),
  );
  // xIsNext: 标记当前轮到谁了
  const [xIsNext, setXIsNext] = useState<boolean>(true);

  // 计算当前的胜负状态（不用存入 state，每次渲染自动计算）
  const winner = calculateWinner(squares);

  /**
   * 处理格子点击事件
   */
  function handleClick(i: number) {
    // 防御性编程：如果有人赢了或者格子已经有棋子，直接无视点击
    if (winner || squares[i]) return;

    // --- React 核心思维：不可变性 (Immutability) ---
    // 在 Vue 里我们可以 squares[i] = 'X'，但在 React 里必须先拷贝一份副本
    const nextSquares = [...squares];

    // 在副本上进行修改
    nextSquares[i] = xIsNext ? "X" : "O";

    // 用新副本替换旧状态，触发 React 重新渲染页面
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  // 计算状态提示文字
  const status = winner
    ? `获胜者: ${winner}`
    : squares.includes(null)
      ? `下一步: ${xIsNext ? "X" : "O"}`
      : "平局！";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
      <h1 className="text-4xl font-bold mb-8 text-cyan-400">AI 三子棋实验场</h1>

      <div
        className={`text-2xl mb-6 font-semibold ${winner ? "text-green-400 animate-bounce" : ""}`}
      >
        {status}
      </div>

      {/* 棋盘布局：3x3 网格 */}
      <div className="grid grid-cols-3 gap-3 bg-slate-800 p-3 rounded-xl shadow-2xl">
        {squares.map((value, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            // 用 Tailwind CSS 处理样式，React 中 class 要写成 className
            className="w-24 h-24 bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-4xl font-bold rounded-lg transition-all active:scale-90"
          >
            <span
              className={value === "X" ? "text-pink-500" : "text-yellow-400"}
            >
              {value}
            </span>
          </button>
        ))}
      </div>

      {/* 重置按钮 */}
      <button
        onClick={() => {
          setSquares(Array(9).fill(null));
          setXIsNext(true);
        }}
        className="mt-10 px-8 py-3 bg-slate-700 hover:bg-rose-600 rounded-full transition-colors font-bold"
      >
        重置棋局
      </button>
    </main>
  );
}
