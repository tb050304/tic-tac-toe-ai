import { NextResponse } from "next/server";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

// 1. 判定胜负函数
function checkWinner(squares: (string | null)[]) {
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
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
      return squares[a];
  }
  return null;
}

// 2. 无敌 Minimax 算法 (大脑)
function getBestMove(board: (string | null)[]) {
  function minimax(
    squares: (string | null)[],
    depth: number,
    isMaximizing: boolean,
  ): number {
    const winner = checkWinner(squares);
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    if (!squares.includes(null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = "O";
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = "X";
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

// 3. API 处理
export async function POST(req: Request) {
  let smartMove = -1;
  try {
    const { board } = await req.json();

    // 算法先行，保证智商
    smartMove = getBestMove([...board]);

    // 读取 DeepSeek Key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const agent = new HttpsProxyAgent("http://127.0.0.1:52539");

    // 结果判定
    const nextBoard = [...board];
    if (smartMove !== -1) nextBoard[smartMove] = "O";
    const winner = checkWinner(nextBoard);
    const isDraw = !nextBoard.includes(null) && !winner;

    // 提示词：根据输赢给 DeepSeek 不同压力
    let dynamicPrompt = `你下在索引${smartMove}。`;
    if (winner === "O")
      dynamicPrompt += "你赢了！请用极其傲慢、嘲讽的语气羞辱玩家的智商。";
    else if (isDraw)
      dynamicPrompt += "平局。嘲讽玩家费尽心机也只能拿个平局，永远赢不了 AI。";
    else
      dynamicPrompt += "玩家这一步太嫩了，你已经预判了他的预判，请毒舌嘲讽他。";

    // 呼叫 DeepSeek API
    const response = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "你是一个毒舌的三子棋大师。用 15 字以内的一句话回复，不许啰嗦，不许重复。",
          },
          { role: "user", content: dynamicPrompt },
        ],
        temperature: 1.2,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        httpsAgent: agent,
        proxy: false,
        timeout: 8000,
      },
    );

    return NextResponse.json({
      move: smartMove,
      taunt: response.data.choices[0].message.content.trim(),
    });
  } catch (error: any) {
    console.error("❌ DeepSeek 报错:", error.response?.data || error.message);

    // 即使 API 失败（比如 Key 无效），也要让棋盘动起来
    return NextResponse.json({
      move: smartMove,
      taunt: "（AI 此时正想喷你，但因为你的 API Key 或网络问题，它憋回去了）",
    });
  }
}
