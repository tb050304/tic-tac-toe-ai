import { NextResponse } from "next/server";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { calculateWinner } from "@/lib/gameLogic";

// 2. 无敌 Minimax 算法 (大脑)
function getBestMove(board: (string | null)[]) {
  function minimax(
    squares: (string | null)[],
    depth: number,
    isMaximizing: boolean,
  ): number {
    const winner = calculateWinner(squares);
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

const posMap: Record<number, string> = {
  0: "左上角",
  1: "顶部中间",
  2: "右上角",
  3: "左边中间",
  4: "中心位置",
  5: "右边中间",
  6: "左下角",
  7: "底部中间",
  8: "右下角",
};
// 3. API 处理
export async function POST(req: Request) {
  try {
    // 关键：现在我们要接收 board 和之前的 messages 列表
    const { board, history, userMove } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const proxyUrl = process.env.HTTP_PROXY;
    const baseUrl =
      process.env.DEEPSEEK_BASE_URL ||
      "https://api.deepseek.com/chat/completions";
    const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

    const smartMove = getBestMove([...board]);
    const nextBoard = [...board];
    if (smartMove !== -1) nextBoard[smartMove] = "O";
    const winner = calculateWinner(nextBoard);
    const isDraw = !nextBoard.includes(null) && !winner;

    const playerPos = posMap[userMove] || "某个位置";
    const aiPos = posMap[smartMove] || "某个位置";
    // 构造当前局面的描述
    let dynamicPrompt = `玩家刚刚下在了【${playerPos}】。作为回应，你下在了【${aiPos}】。`;

    if (winner === "O") {
      dynamicPrompt += `你这一手直接在${aiPos}完成了绝杀，你赢了！请用最狂妄的话羞辱玩家下的那手${playerPos}简直是自寻死路。`;
    } else if (isDraw) {
      dynamicPrompt += `这局平了。嘲讽玩家即便占了${playerPos}也没能赢过你。`;
    } else {
      dynamicPrompt += `请针对玩家下的【${playerPos}】写一句极其损人的短评，并解释为什么你下在【${aiPos}】更高明。`;
    }

    // 构造发送给 DeepSeek 的消息数组
    // 我们把历史记录也塞进去，让 AI 记得它之前骂过什么
    const apiMessages = [
      {
        role: "system",
        content:
          "你是一个毒舌的三子棋战神。你会记得之前的对话，如果玩家回怼你，你要更狠地怼回去。保持回复在 20 字以内。",
      },
      ...history, // 展开之前的历史记录
      {
        role: "user",
        content: `当前棋盘：${JSON.stringify(board)}。${dynamicPrompt}`,
      },
    ];

    const response = await axios.post(
      baseUrl,
      {
        model: model,
        messages: apiMessages,
        temperature: 1.3,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        ...(agent ? { httpsAgent: agent } : {}),
        proxy: false,
      },
    );

    const taunt = response.data.choices[0].message.content.trim();
    return NextResponse.json({ move: smartMove, taunt });
  } catch (error: any) {
    console.error("❌ 错误:", error.message);
    return NextResponse.json({ move: 0, taunt: "（信号不好，先放你一马）" });
  }
}
