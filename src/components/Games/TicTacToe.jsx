import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "filbert_tictactoe_settings_v3";


const BOARD_OPTIONS = {
  "3x3": { size: 3, target: 3, label: "3x3 / Win 3" },
  "4x4": { size: 4, target: 3, label: "4x4 / Win 3" },
  "5x5": { size: 5, target: 4, label: "5x5 / Win 4" },
};

const MATCH_OPTIONS = [
  { label: "Free Play", value: 0 },
  { label: "Best of 3", value: 3 },
  { label: "Best of 5", value: 5 },
];

function createEmptyBoard(size) {
  return Array(size * size).fill(null);
}

function generateWinPatterns(size, target) {
  const patterns = [];
  const index = (row, col) => row * size + col;

  // Horizontal
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - target; col++) {
      const line = [];
      for (let k = 0; k < target; k++) line.push(index(row, col + k));
      patterns.push(line);
    }
  }

  // Vertical
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - target; row++) {
      const line = [];
      for (let k = 0; k < target; k++) line.push(index(row + k, col));
      patterns.push(line);
    }
  }

  // Diagonal ↘
  for (let row = 0; row <= size - target; row++) {
    for (let col = 0; col <= size - target; col++) {
      const line = [];
      for (let k = 0; k < target; k++) line.push(index(row + k, col + k));
      patterns.push(line);
    }
  }

  // Diagonal ↙
  for (let row = 0; row <= size - target; row++) {
    for (let col = target - 1; col < size; col++) {
      const line = [];
      for (let k = 0; k < target; k++) line.push(index(row + k, col - k));
      patterns.push(line);
    }
  }

  return patterns;
}

function calculateWinner(board, patterns) {
  for (const pattern of patterns) {
    const first = board[pattern[0]];
    if (!first) continue;

    const isWin = pattern.every((idx) => board[idx] === first);
    if (isWin) return { winner: first, line: pattern };
  }
  return null;
}

function getEmptyIndexes(board) {
  return board
    .map((cell, index) => (cell === null ? index : null))
    .filter((v) => v !== null);
}

function getRandomMove(board) {
  const empty = getEmptyIndexes(board);
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

function findWinningMove(board, patterns, player) {
  for (const pattern of patterns) {
    let playerCount = 0;
    let emptyIndex = null;
    let emptyCount = 0;
    let blocked = false;

    for (const idx of pattern) {
      if (board[idx] === player) {
        playerCount++;
      } else if (board[idx] === null) {
        emptyCount++;
        emptyIndex = idx;
      } else {
        blocked = true;
        break;
      }
    }

    if (!blocked && playerCount === pattern.length - 1 && emptyCount === 1) {
      return emptyIndex;
    }
  }
  return null;
}

function getCenterCells(size) {
  if (size % 2 === 1) {
    return [Math.floor((size * size) / 2)];
  }

  const mid1 = size / 2 - 1;
  const mid2 = size / 2;
  return [
    mid1 * size + mid1,
    mid1 * size + mid2,
    mid2 * size + mid1,
    mid2 * size + mid2,
  ];
}

function getStrategicMove(board, size) {
  const centers = getCenterCells(size).filter((idx) => board[idx] === null);
  if (centers.length > 0) {
    return centers[Math.floor(Math.random() * centers.length)];
  }

  const corners = [
    0,
    size - 1,
    size * (size - 1),
    size * size - 1,
  ].filter((idx) => board[idx] === null);

  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  return getRandomMove(board);
}

function getMediumMove(board, patterns, size, botSymbol, humanSymbol) {
  const winningMove = findWinningMove(board, patterns, botSymbol);
  if (winningMove !== null) return winningMove;

  const blockMove = findWinningMove(board, patterns, humanSymbol);
  if (blockMove !== null) return blockMove;

  return getStrategicMove(board, size);
}

function evaluateLine(cells, botSymbol, humanSymbol) {
  let botCount = 0;
  let humanCount = 0;
  let emptyCount = 0;

  for (const cell of cells) {
    if (cell === botSymbol) botCount++;
    else if (cell === humanSymbol) humanCount++;
    else emptyCount++;
  }

  if (botCount > 0 && humanCount > 0) return 0;

  if (botCount > 0 && humanCount === 0) {
    if (botCount === cells.length) return 100000;
    if (botCount === cells.length - 1 && emptyCount === 1) return 1500;
    if (botCount === cells.length - 2 && emptyCount === 2) return 150;
    return botCount * 20;
  }

  if (humanCount > 0 && botCount === 0) {
    if (humanCount === cells.length) return -100000;
    if (humanCount === cells.length - 1 && emptyCount === 1) return -1800;
    if (humanCount === cells.length - 2 && emptyCount === 2) return -180;
    return -(humanCount * 25);
  }

  return 0;
}

function evaluateBoard(board, patterns, size, botSymbol, humanSymbol) {
  let score = 0;

  for (const pattern of patterns) {
    const cells = pattern.map((idx) => board[idx]);
    score += evaluateLine(cells, botSymbol, humanSymbol);
  }

  const centers = getCenterCells(size);
  for (const idx of centers) {
    if (board[idx] === botSymbol) score += 30;
    if (board[idx] === humanSymbol) score -= 30;
  }

  return score;
}

function minimax(board, patterns, depth, isMaximizing, maxDepth, botSymbol, humanSymbol, size) {
  const result = calculateWinner(board, patterns);

  if (result?.winner === botSymbol) return 100000 - depth;
  if (result?.winner === humanSymbol) return depth - 100000;
  if (getEmptyIndexes(board).length === 0) return 0;

  if (depth >= maxDepth) {
    return evaluateBoard(board, patterns, size, botSymbol, humanSymbol);
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const idx of getEmptyIndexes(board)) {
      board[idx] = botSymbol;
      const score = minimax(
        board,
        patterns,
        depth + 1,
        false,
        maxDepth,
        botSymbol,
        humanSymbol,
        size
      );
      board[idx] = null;
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const idx of getEmptyIndexes(board)) {
      board[idx] = humanSymbol;
      const score = minimax(
        board,
        patterns,
        depth + 1,
        true,
        maxDepth,
        botSymbol,
        humanSymbol,
        size
      );
      board[idx] = null;
      bestScore = Math.min(bestScore, score);
    }
    return bestScore;
  }
}

function getHardMove(board, patterns, size, botSymbol, humanSymbol) {
  const winNow = findWinningMove(board, patterns, botSymbol);
  if (winNow !== null) return winNow;

  const blockNow = findWinningMove(board, patterns, humanSymbol);
  if (blockNow !== null) return blockNow;

  let maxDepth = 9;
  if (size === 4) maxDepth = 4;
  if (size === 5) maxDepth = 3;

  let bestScore = -Infinity;
  let bestMove = null;

  for (const idx of getEmptyIndexes(board)) {
    board[idx] = botSymbol;

    const score = minimax(
      board,
      patterns,
      0,
      false,
      maxDepth,
      botSymbol,
      humanSymbol,
      size
    );

    board[idx] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = idx;
    }
  }

  if (bestMove === null) return getStrategicMove(board, size);
  return bestMove;
}

function getBotMove(board, difficulty, patterns, size, botSymbol, humanSymbol) {
  if (difficulty === "easy") return getRandomMove(board);
  if (difficulty === "medium") {
    return getMediumMove(board, patterns, size, botSymbol, humanSymbol);
  }
  return getHardMove([...board], patterns, size, botSymbol, humanSymbol);
}

function getMatchTarget(matchMode) {
  if (!matchMode) return null;
  return Math.ceil(matchMode / 2);
}

function Square({ value, onClick, isWinning, disabled, size }) {
  const sizeClass =
    size === 5
      ? "text-xl sm:text-2xl md:text-3xl"
      : size === 4
      ? "text-2xl sm:text-3xl md:text-4xl"
      : "text-3xl sm:text-4xl md:text-5xl";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`aspect-square w-full rounded-2xl border flex items-center justify-center font-bold transition-all duration-200
        ${sizeClass}
        ${
          isWinning
            ? "border-blue-400 bg-blue-500/15 shadow-[0_0_25px_rgba(59,130,246,0.25)]"
            : "border-white/10 bg-[#0b0b0f] hover:border-blue-500/40 hover:bg-white/[0.02]"
        }
        ${disabled ? "cursor-not-allowed opacity-85" : ""}
      `}
    >
      <span className={value === "X" ? "text-blue-400" : "text-white"}>
        {value}
      </span>
    </button>
  );
}

function ResultToast({ toast, onClose }) {
  if (!toast.show) return null;

  const toneClass =
    toast.type === "win"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : toast.type === "lose"
      ? "border-red-500/40 bg-red-500/10 text-red-300"
      : toast.type === "draw"
      ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-200"
      : "border-blue-500/40 bg-blue-500/10 text-blue-300";

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-full">
      <div className={`rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur ${toneClass}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">{toast.title}</p>
            <p className="text-xs sm:text-sm mt-1 opacity-90">{toast.message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-sm opacity-70 hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function TicTacToe() {
  const [boardMode, setBoardMode] = useState("3x3");
  const [gameMode, setGameMode] = useState("bot");
  const [difficulty, setDifficulty] = useState("easy");
  const [playerSymbol, setPlayerSymbol] = useState("X");
  const [matchMode, setMatchMode] = useState(0);

  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 });
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const toastTimerRef = useRef(null);
  const audioCtxRef = useRef(null);

  const { size, target, label } = BOARD_OPTIONS[boardMode];
  const humanSymbol = playerSymbol;
  const botSymbol = playerSymbol === "X" ? "O" : "X";

  const [board, setBoard] = useState(createEmptyBoard(BOARD_OPTIONS["3x3"].size));
  const [currentPlayer, setCurrentPlayer] = useState("X");

  const winPatterns = useMemo(() => generateWinPatterns(size, target), [size, target]);
  const result = useMemo(() => calculateWinner(board, winPatterns), [board, winPatterns]);

  const winner = result?.winner || null;
  const winningLine = result?.line || [];
  const isDraw = !winner && board.every((cell) => cell !== null);
  const roundNumber = history.length + 1;
  const matchTarget = getMatchTarget(matchMode);

  const isBotTurn =
    gameMode === "bot" &&
    !winner &&
    !isDraw &&
    currentPlayer === botSymbol;

  function playTone(freq = 440, duration = 0.12, type = "sine", volume = 0.03) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = volume;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.start(now);
      osc.stop(now + duration);
    } catch (err) {
      console.error("Audio play failed:", err);
    }
  }

  function playClickSound() {
    playTone(520, 0.05, "square", 0.02);
  }

  function playWinSound() {
    playTone(520, 0.09, "sine", 0.03);
    setTimeout(() => playTone(660, 0.11, "sine", 0.03), 80);
    setTimeout(() => playTone(820, 0.14, "sine", 0.03), 170);
  }

  function playLoseSound() {
    playTone(340, 0.1, "triangle", 0.03);
    setTimeout(() => playTone(260, 0.12, "triangle", 0.03), 100);
    setTimeout(() => playTone(180, 0.14, "triangle", 0.03), 200);
  }

  function playDrawSound() {
    playTone(420, 0.08, "sine", 0.025);
    setTimeout(() => playTone(420, 0.08, "sine", 0.025), 120);
  }

  function showToast(title, message, type = "info") {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setToast({
      show: true,
      title,
      message,
      type,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2800);
  }

  function closeToast() {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast((prev) => ({ ...prev, show: false }));
  }

  // load local storage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved) return;

      if (saved.boardMode && BOARD_OPTIONS[saved.boardMode]) setBoardMode(saved.boardMode);
      if (saved.gameMode) setGameMode(saved.gameMode);
      if (saved.difficulty) setDifficulty(saved.difficulty);
      if (saved.playerSymbol === "X" || saved.playerSymbol === "O") {
        setPlayerSymbol(saved.playerSymbol);
      }
      if (typeof saved.matchMode === "number") setMatchMode(saved.matchMode);
      if (saved.score) setScore(saved.score);
      if (Array.isArray(saved.history)) setHistory(saved.history.slice(0, 12));
    } catch (err) {
      console.error("Failed to load TicTacToe settings:", err);
    }
  }, []);

  // save local storage
  useEffect(() => {
    const payload = {
      boardMode,
      gameMode,
      difficulty,
      playerSymbol,
      matchMode,
      score,
      history: history.slice(0, 12),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [boardMode, gameMode, difficulty, playerSymbol, matchMode, score, history]);

  useEffect(() => {
    setBoard(createEmptyBoard(size));
    setCurrentPlayer("X");
  }, [size, playerSymbol, gameMode]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const statusText = winner
    ? gameMode === "bot"
      ? winner === humanSymbol
        ? "You Win!"
        : "Bot Wins!"
      : `Winner: ${winner}`
    : isDraw
    ? "It's a Draw!"
    : gameMode === "bot"
    ? currentPlayer === humanSymbol
      ? `Your Turn (${humanSymbol})`
      : `Bot Thinking... (${difficulty})`
    : `Turn: ${currentPlayer}`;

  const getScoreLabel = (symbol) => {
    if (gameMode === "pvp") return symbol;
    if (symbol === humanSymbol) return `You (${symbol})`;
    return `Bot (${symbol})`;
  };

  const appendHistory = (resultLabel) => {
    const entry = {
      id: Date.now(),
      round: history.length + 1,
      result: resultLabel,
      boardLabel: label,
      mode:
        gameMode === "bot"
          ? `Vs Bot / ${difficulty}`
          : "PvP",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setHistory((prev) => [entry, ...prev].slice(0, 10));
  };

  const checkMatchWinner = (nextScore) => {
    if (!matchTarget) return null;

    const xWins = nextScore.X;
    const oWins = nextScore.O;

    if (xWins >= matchTarget) return "X";
    if (oWins >= matchTarget) return "O";
    return null;
  };

  const finishRound = (winnerSymbol, draw = false) => {
    if (draw) {
      setScore((prev) => {
        const next = { ...prev, draw: prev.draw + 1 };
        return next;
      });

      appendHistory("Draw");
        playDrawSound();
        showToast("Draw Round", `Round ${roundNumber} ended in a draw.`, "draw");

        if (!matchTarget || !checkMatchWinner(score)) {
        goNextRound();
        }
        return;
    }

    setScore((prev) => {
      const next = {
        ...prev,
        [winnerSymbol]: prev[winnerSymbol] + 1,
      };

      const matchWinner = checkMatchWinner(next);

      if (gameMode === "bot") {
        if (winnerSymbol === humanSymbol) {
          playWinSound();
          showToast("You Win!", `Round ${roundNumber} goes to you.`, "win");
          appendHistory("You Win");
        } else {
          playLoseSound();
          showToast("Bot Wins", `Round ${roundNumber} goes to the bot.`, "lose");
          appendHistory("Bot Wins");
        }
      } else {
        playWinSound();
        showToast(`Player ${winnerSymbol} Wins`, `Round ${roundNumber} completed.`, "win");
        appendHistory(`Player ${winnerSymbol} Wins`);
      }

      if (matchWinner) {
        setTimeout(() => {
            if (gameMode === "bot") {
            const title =
                matchWinner === humanSymbol ? "Match Won!" : "Match Lost";
            const msg =
                matchWinner === humanSymbol
                ? `You won the ${matchMode === 3 ? "Best of 3" : "Best of 5"} match.`
                : `Bot won the ${matchMode === 3 ? "Best of 3" : "Best of 5"} match.`;

            showToast(title, msg, matchWinner === humanSymbol ? "win" : "lose");
            } else {
            showToast(
                `Match Winner: ${matchWinner}`,
                `${matchWinner} wins the ${matchMode === 3 ? "Best of 3" : "Best of 5"} match.`,
                "win"
            );
            }
        }, 400);
        } else {
        goNextRound();
        }

      return next;
    });
  };

  const makeMove = (index, player) => {
    if (board[index] || winner || isDraw) return false;

    playClickSound();

    const nextBoard = [...board];
    nextBoard[index] = player;
    setBoard(nextBoard);

    const nextResult = calculateWinner(nextBoard, winPatterns);
    const nextWinner = nextResult?.winner || null;
    const nextDraw = !nextWinner && nextBoard.every((cell) => cell !== null);

    if (nextWinner) {
      finishRound(nextWinner, false);
    } else if (nextDraw) {
      finishRound(null, true);
    } else {
      setCurrentPlayer(player === "X" ? "O" : "X");
    }

    return true;
  };

  const handleClick = (index) => {
    if (gameMode === "bot") {
      if (currentPlayer !== humanSymbol) return;
      makeMove(index, humanSymbol);
    } else {
      makeMove(index, currentPlayer);
    }
  };

  // bot move
  useEffect(() => {
    if (!isBotTurn) return;

    const timeout = setTimeout(() => {
      const move = getBotMove(
        board,
        difficulty,
        winPatterns,
        size,
        botSymbol,
        humanSymbol
      );

      if (move !== null) {
        makeMove(move, botSymbol);
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [isBotTurn, board, difficulty, winPatterns, size, botSymbol, humanSymbol]);

  const resetBoard = () => {
    setBoard(createEmptyBoard(size));
    setCurrentPlayer("X");
  };

  const resetAll = () => {
    setBoard(createEmptyBoard(size));
    setCurrentPlayer("X");
    setScore({ X: 0, O: 0, draw: 0 });
    setHistory([]);
    closeToast();
  };

  const changeMode = (mode) => {
    setGameMode(mode);
    setBoard(createEmptyBoard(size));
    setCurrentPlayer("X");
    setScore({ X: 0, O: 0, draw: 0 });
    setHistory([]);
  };

  const changeDifficulty = (level) => {
    setDifficulty(level);
    setBoard(createEmptyBoard(size));
    setCurrentPlayer("X");
  };

  const changeBoardMode = (mode) => {
    setBoardMode(mode);
    const nextSize = BOARD_OPTIONS[mode].size;
    setBoard(createEmptyBoard(nextSize));
    setCurrentPlayer("X");
    setScore({ X: 0, O: 0, draw: 0 });
    setHistory([]);
  };

  const changePlayerSymbol = (symbol) => {
    setPlayerSymbol(symbol);
    setBoard(createEmptyBoard(size));
    setCurrentPlayer("X");
    setScore({ X: 0, O: 0, draw: 0 });
    setHistory([]);
  };

  const changeMatchMode = (value) => {
    setMatchMode(value);
    setBoard(createEmptyBoard(size));
    setCurrentPlayer("X");
    setScore({ X: 0, O: 0, draw: 0 });
    setHistory([]);
  };

  const boardMaxWidth =
    size === 3 ? "max-w-[420px]" : size === 4 ? "max-w-[520px]" : "max-w-[560px]";

  const currentMatchWinner = checkMatchWinner(score);
  const goNextRound = () => {
  setTimeout(() => {
    setBoard(createEmptyBoard(size));
    setCurrentPlayer("X");
  }, 1500);
};

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-8">
        {/* LEFT */}
        <div className="rounded-3xl border border-white/10 bg-[#09090c] p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  Tic Tac Toe
                </h2>
                <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-2xl">
                  Dynamic board, bot AI, match mode, round history, and polished gameplay.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-blue-400 text-xs sm:text-sm w-fit">
                {label}
              </div>
            </div>

            {/* Board Mode */}
            <div>
              <p className="text-xs sm:text-sm text-gray-400 mb-3">Board Mode</p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {Object.entries(BOARD_OPTIONS).map(([key, option]) => (
                  <button
                    key={key}
                    onClick={() => changeBoardMode(key)}
                    className={`px-4 py-2 rounded-xl border text-sm sm:text-base transition ${
                      boardMode === key
                        ? "border-purple-500 bg-purple-500/20 text-purple-300"
                        : "border-white/10 text-gray-300 hover:border-purple-500/40"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div>
              <p className="text-xs sm:text-sm text-gray-400 mb-3">Mode</p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => changeMode("bot")}
                  className={`px-4 py-2 rounded-xl border text-sm sm:text-base transition ${
                    gameMode === "bot"
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-white/10 text-gray-300 hover:border-blue-500/40"
                  }`}
                >
                  Vs Bot
                </button>

                <button
                  onClick={() => changeMode("pvp")}
                  className={`px-4 py-2 rounded-xl border text-sm sm:text-base transition ${
                    gameMode === "pvp"
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-white/10 text-gray-300 hover:border-blue-500/40"
                  }`}
                >
                  PvP
                </button>
              </div>
            </div>

            {/* Match Mode */}
            <div>
              <p className="text-xs sm:text-sm text-gray-400 mb-3">Match Mode</p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {MATCH_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => changeMatchMode(item.value)}
                    className={`px-4 py-2 rounded-xl border text-sm sm:text-base transition ${
                      matchMode === item.value
                        ? "border-pink-500 bg-pink-500/20 text-pink-300"
                        : "border-white/10 text-gray-300 hover:border-pink-500/40"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symbol */}
            {gameMode === "bot" && (
              <div>
                <p className="text-xs sm:text-sm text-gray-400 mb-3">Your Symbol</p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() => changePlayerSymbol("X")}
                    className={`px-4 py-2 rounded-xl border text-sm sm:text-base transition ${
                      playerSymbol === "X"
                        ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                        : "border-white/10 text-gray-300 hover:border-cyan-500/40"
                    }`}
                  >
                    Play as X
                  </button>

                  <button
                    onClick={() => changePlayerSymbol("O")}
                    className={`px-4 py-2 rounded-xl border text-sm sm:text-base transition ${
                      playerSymbol === "O"
                        ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                        : "border-white/10 text-gray-300 hover:border-cyan-500/40"
                    }`}
                  >
                    Play as O
                  </button>
                </div>
              </div>
            )}

            {/* Difficulty */}
            {gameMode === "bot" && (
              <div>
                <p className="text-xs sm:text-sm text-gray-400 mb-3">Bot Difficulty</p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() => changeDifficulty("easy")}
                    className={`px-4 py-2 rounded-xl border text-sm sm:text-base transition ${
                      difficulty === "easy"
                        ? "border-green-500 bg-green-500/20 text-green-400"
                        : "border-white/10 text-gray-300 hover:border-green-500/40"
                    }`}
                  >
                    Easy
                  </button>

                  <button
                    onClick={() => changeDifficulty("medium")}
                    className={`px-4 py-2 rounded-xl border text-sm sm:text-base transition ${
                      difficulty === "medium"
                        ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                        : "border-white/10 text-gray-300 hover:border-yellow-500/40"
                    }`}
                  >
                    Medium
                  </button>

                  <button
                    onClick={() => changeDifficulty("hard")}
                    className={`px-4 py-2 rounded-xl border text-sm sm:text-base transition ${
                      difficulty === "hard"
                        ? "border-red-500 bg-red-500/20 text-red-400"
                        : "border-white/10 text-gray-300 hover:border-red-500/40"
                    }`}
                  >
                    Hard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STATUS */}
          <div className="mb-5 sm:mb-6 rounded-2xl border border-white/10 bg-black/40 px-4 sm:px-5 py-4">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Game Status</p>
            <h3 className="text-lg sm:text-2xl font-semibold text-white break-words">
              {statusText}
            </h3>

            {matchMode !== 0 && (
              <p className="text-xs sm:text-sm text-pink-300 mt-2">
                {currentMatchWinner
                  ? `Match Winner: ${gameMode === "bot"
                      ? currentMatchWinner === humanSymbol
                        ? "You"
                        : "Bot"
                      : currentMatchWinner}`
                  : `First to ${matchTarget} wins the match`}
              </p>
            )}
          </div>

          {/* BOARD */}
          <div className={`w-full ${boardMaxWidth} mx-auto`}>
            <div
              className="grid gap-3 sm:gap-4"
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            >
              {board.map((cell, index) => (
                <Square
                  key={index}
                  value={cell}
                  onClick={() => handleClick(index)}
                  isWinning={winningLine.includes(index)}
                  disabled={isBotTurn || !!winner || isDraw || !!currentMatchWinner}
                  size={size}
                />
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              onClick={resetBoard}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-medium"
            >
              Reset Round
            </button>

            <button
              onClick={resetAll}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-white/10 hover:border-blue-500/40 transition font-medium"
            >
              Reset Scoreboard
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#09090c] p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-5">
              Scoreboard
            </h3>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5 text-center">
                <p className="text-xs sm:text-sm text-gray-400 mb-2">
                  {getScoreLabel("X")}
                </p>
                <h4 className="text-2xl sm:text-3xl font-bold text-blue-400">
                  {score.X}
                </h4>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5 text-center">
                <p className="text-xs sm:text-sm text-gray-400 mb-2">
                  {getScoreLabel("O")}
                </p>
                <h4 className="text-2xl sm:text-3xl font-bold text-white">
                  {score.O}
                </h4>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5 text-center">
                <p className="text-xs sm:text-sm text-gray-400 mb-2">Draw</p>
                <h4 className="text-2xl sm:text-3xl font-bold text-gray-300">
                  {score.draw}
                </h4>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#09090c] p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4">
              Current Setup
            </h3>
            <div className="space-y-3 text-sm sm:text-base text-gray-300">
              <p>
                <span className="text-gray-400">Board:</span>{" "}
                <span className="text-white font-medium">{label}</span>
              </p>
              <p>
                <span className="text-gray-400">Mode:</span>{" "}
                <span className="text-white font-medium">
                  {gameMode === "bot" ? "Vs Bot" : "PvP"}
                </span>
              </p>
              <p>
                <span className="text-gray-400">Match:</span>{" "}
                <span className="text-white font-medium">
                  {matchMode === 0 ? "Free Play" : `Best of ${matchMode}`}
                </span>
              </p>
              {gameMode === "bot" && (
                <>
                  <p>
                    <span className="text-gray-400">Your Symbol:</span>{" "}
                    <span className="text-white font-medium">{humanSymbol}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Bot Symbol:</span>{" "}
                    <span className="text-white font-medium">{botSymbol}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Difficulty:</span>{" "}
                    <span className="text-white font-medium capitalize">{difficulty}</span>
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#09090c] p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4">
              Round History
            </h3>

            {history.length === 0 ? (
              <p className="text-sm text-gray-400">
                No rounds recorded yet. Start a match and the history will appear here.
              </p>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-black/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-white font-medium">
                          Round {item.round} — {item.result}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {item.boardLabel} • {item.mode}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#09090c] p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4">
              Difficulty Info
            </h3>
            <ul className="space-y-3 text-sm sm:text-base text-gray-300 leading-relaxed">
              <li>
                • <span className="text-green-400 font-medium">Easy</span> → bot random.
              </li>
              <li>
                • <span className="text-yellow-400 font-medium">Medium</span> → bot bisa menang / block ancaman.
              </li>
              <li>
                • <span className="text-red-400 font-medium">Hard</span> → minimax + heuristic evaluation buat board besar.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ResultToast toast={toast} onClose={closeToast} />
    </>
  );
}

export default TicTacToe;