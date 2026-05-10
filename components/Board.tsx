"use client"; // 客户端组件，因为需要处理 onClick 点击事件

// 定义棋盘组件接收的参数类型
interface BoardProps {
  squares: (string | null)[]; // 9个格子的状态数组（'X', 'O' 或 null）
  onClick: (i: number) => void; // 点击格子的回调函数，传入索引
  loading: boolean; // 是否处于加载/等待状态
}

export default function Board({ squares, onClick, loading }: BoardProps) {
  return (
    <div
      // 3x3 网格布局，当 loading 为 true 时半透明并禁止点击
      className={`grid grid-cols-3 gap-3 ${loading ? "opacity-50 pointer-events-none" : ""}`}
    >
      {squares.map((v, i) => (
        <button
          key={i}
          onClick={() => onClick(i)}
          // 响应式宽高 (w-20 -> 80px, md:w-28 -> 112px)，悬停效果和阴影
          className="w-20 h-20 md:w-28 md:h-28 bg-slate-800 hover:bg-slate-700 text-4xl font-bold rounded-2xl flex items-center justify-center transition-all shadow-xl"
        >
          {/* 根据值动态切换文字颜色：X 为青色，O 为粉红色 */}
          <span className={v === "X" ? "text-cyan-400" : "text-rose-500"}>
            {v}
          </span>
        </button>
      ))}
    </div>
  );
}
