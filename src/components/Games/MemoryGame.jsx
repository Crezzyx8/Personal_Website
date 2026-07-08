import { useEffect, useMemo, useState } from "react"

const ICONS = [
  "🔥", "⚡", "🎯", "🚀", "💎", "🎮",
  "🧠", "👾", "🌙", "⭐", "🍀", "🎲",
  "🐉", "🦊", "🐼", "🍕", "🍔", "🍩"
]

const difficultyConfig = {
  easy: { label: "Easy", rows: 4, cols: 4 },
  medium: { label: "Medium", rows: 4, cols: 5 },
  hard: { label: "Hard", rows: 6, cols: 6 },
}

const STORAGE_KEY = "filbert_memory_history_v1"

function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function generateCards(level) {
  const { rows, cols } = difficultyConfig[level]
  const totalCards = rows * cols
  const pairCount = totalCards / 2

  const selectedIcons = ICONS.slice(0, pairCount)
  const duplicated = [...selectedIcons, ...selectedIcons]

  return shuffleArray(duplicated).map((icon, index) => ({
    id: `${icon}-${index}`,
    icon,
    flipped: false,
    matched: false,
  }))
}

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState("easy")
  const [cards, setCards] = useState([])
  const [selectedCards, setSelectedCards] = useState([])
  const [moves, setMoves] = useState(0)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [history, setHistory] = useState([])
  const [hasSavedWin, setHasSavedWin] = useState(false)

  const config = difficultyConfig[difficulty]
  const totalPairs = (config.rows * config.cols) / 2
  const hasWon = matchedPairs === totalPairs && totalPairs > 0

  const gridClass = useMemo(() => {
    if (difficulty === "easy") return "grid-cols-4"
    if (difficulty === "medium") return "grid-cols-5"
    return "grid-cols-6"
  }, [difficulty])

  const appendHistory = (resultLabel, extra = {}) => {
    setHistory((prev) => {
      const newEntry = {
        id: Date.now(),
        result: resultLabel,
        difficulty: config.label,
        board: `${config.rows}x${config.cols}`,
        totalPairs,
        moves,
        time: seconds,
        timestamp: new Date().toLocaleString(),
        ...extra,
      }

      const updated = [newEntry, ...prev].slice(0, 30)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const historyStats = useMemo(() => {
    const total = history.length
    const completed = history.filter((item) => item.result === "Completed").length

    const bestMoves =
      history.length > 0
        ? Math.min(...history.map((item) => item.moves ?? Infinity))
        : null

    const bestTime =
      history.length > 0
        ? Math.min(...history.map((item) => item.time ?? Infinity))
        : null

    return {
      total,
      completed,
      bestMoves: bestMoves === Infinity ? null : bestMoves,
      bestTime: bestTime === Infinity ? null : bestTime,
    }
  }, [history])

  const resetGame = (level = difficulty) => {
    setCards(generateCards(level))
    setSelectedCards([])
    setMoves(0)
    setMatchedPairs(0)
    setSeconds(0)
    setIsRunning(false)
    setIsChecking(false)
    setHasSavedWin(false)
  }

  useEffect(() => {
    resetGame(difficulty)
  }, [difficulty])

  useEffect(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
      if (Array.isArray(savedHistory)) {
        setHistory(savedHistory)
      }
    } catch (err) {
      console.error("Failed to load memory history:", err)
    }
  }, [])

  useEffect(() => {
    if (!isRunning || hasWon) return

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, hasWon])

  useEffect(() => {
    if (!hasWon || hasSavedWin) return

    appendHistory("Completed")
    setHasSavedWin(true)
    setIsRunning(false)
  }, [hasWon, hasSavedWin])

  const handleCardClick = (card) => {
    if (isChecking) return
    if (card.flipped || card.matched) return
    if (selectedCards.length === 2) return

    if (!isRunning) setIsRunning(true)

    const updatedCards = cards.map((c) =>
      c.id === card.id ? { ...c, flipped: true } : c
    )
    setCards(updatedCards)

    const newSelected = [...selectedCards, { ...card, flipped: true }]
    setSelectedCards(newSelected)

    if (newSelected.length === 2) {
      setIsChecking(true)
      setMoves((prev) => prev + 1)

      const [first, second] = newSelected

      if (first.icon === second.icon) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id
                ? { ...c, matched: true }
                : c
            )
          )
          setMatchedPairs((prev) => prev + 1)
          setSelectedCards([])
          setIsChecking(false)
        }, 500)
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id
                ? { ...c, flipped: false }
                : c
            )
          )
          setSelectedCards([])
          setIsChecking(false)
        }, 900)
      }
    }
  }

  const formatTime = (totalSeconds) => {
    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0")
    const secs = String(totalSeconds % 60).padStart(2, "0")
    return `${mins}:${secs}`
  }

  const formatHistoryTime = (value) => {
    if (value === null || value === undefined) return "-"
    return formatTime(value)
  }

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Memory Match
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">
          Match all pairs as fast as you can.
        </p>
      </div>

      {/* Top Controls */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 md:p-5 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {Object.entries(difficultyConfig).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  difficulty === key
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                }`}
              >
                {value.label} ({value.rows}x{value.cols})
              </button>
            ))}
          </div>

          <button
            onClick={() => resetGame()}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition text-sm font-medium"
          >
            Restart
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
            <p className="text-xs text-gray-400">Moves</p>
            <p className="text-lg font-semibold text-white">{moves}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
            <p className="text-xs text-gray-400">Pairs</p>
            <p className="text-lg font-semibold text-white">
              {matchedPairs}/{totalPairs}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
            <p className="text-xs text-gray-400">Time</p>
            <p className="text-lg font-semibold text-white">
              {formatTime(seconds)}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
            <p className="text-xs text-gray-400">Mode</p>
            <p className="text-lg font-semibold text-blue-400">
              {config.label}
            </p>
          </div>
        </div>
      </div>

      {/* Win State */}
      {hasWon && (
        <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-center">
          <h2 className="text-xl font-semibold text-blue-400">
            You cleared the board 🎉
          </h2>
          <p className="text-gray-300 mt-1 text-sm">
            Finished in {moves} moves and {formatTime(seconds)}.
          </p>
        </div>
      )}

      {/* Board */}
      <div
        className={`
          grid ${gridClass} gap-2 sm:gap-3 md:gap-4
          w-full
        `}
      >
        {cards.map((card) => {
          const showFront = card.flipped || card.matched

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={card.matched || isChecking}
              className={`
                aspect-square rounded-2xl perspective group
                ${card.matched ? "cursor-default" : "cursor-pointer"}
              `}
            >
              <div
                className={`
                  relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]
                  ${showFront ? "rotate-y-180" : ""}
                `}
              >
                {/* Back */}
                <div className="absolute inset-0 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-md [backface-visibility:hidden] flex items-center justify-center">
                  <span className="text-xl md:text-2xl text-blue-400">?</span>
                </div>

                {/* Front */}
                <div className="absolute inset-0 rounded-2xl border border-blue-500/30 bg-blue-500/10 shadow-lg shadow-blue-500/10 [transform:rotateY(180deg)] [backface-visibility:hidden] flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl md:text-4xl">
                    {card.icon}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* History Panel */}
      <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Match History
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Saved records from your Memory Match sessions.
            </p>
          </div>

          <button
            onClick={() => {
              setHistory([])
              localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
            }}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-gray-300 hover:border-red-500/40 hover:text-red-300 transition"
          >
            Clear
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
            <p className="text-xs text-gray-400">Total Plays</p>
            <p className="text-lg font-semibold text-white">
              {historyStats.total}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
            <p className="text-xs text-gray-400">Completed</p>
            <p className="text-lg font-semibold text-emerald-400">
              {historyStats.completed}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
            <p className="text-xs text-gray-400">Best Moves</p>
            <p className="text-lg font-semibold text-blue-400">
              {historyStats.bestMoves ?? "-"}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
            <p className="text-xs text-gray-400">Best Time</p>
            <p className="text-lg font-semibold text-yellow-400">
              {formatHistoryTime(historyStats.bestTime)}
            </p>
          </div>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-4 text-sm text-gray-500">
            No completed runs yet. Finish a board and your history will appear here.
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-zinc-800 bg-black/30 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                      {item.result}
                    </span>
                    <span className="text-sm text-white font-medium">
                      {item.difficulty} • {item.board}
                    </span>
                  </div>

                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {item.timestamp}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-xl border border-zinc-800 px-3 py-2">
                    <p className="text-gray-500">Moves</p>
                    <p className="text-white mt-1">{item.moves}</p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 px-3 py-2">
                    <p className="text-gray-500">Time</p>
                    <p className="text-white mt-1">{formatTime(item.time)}</p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 px-3 py-2">
                    <p className="text-gray-500">Pairs</p>
                    <p className="text-white mt-1">{item.totalPairs}</p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 px-3 py-2">
                    <p className="text-gray-500">Difficulty</p>
                    <p className="text-white mt-1">{item.difficulty}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}