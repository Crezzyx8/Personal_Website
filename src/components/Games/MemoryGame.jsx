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

  const config = difficultyConfig[difficulty]
  const totalPairs = (config.rows * config.cols) / 2
  const hasWon = matchedPairs === totalPairs && totalPairs > 0

  const gridClass = useMemo(() => {
    if (difficulty === "easy") return "grid-cols-4"
    if (difficulty === "medium") return "grid-cols-5"
    return "grid-cols-6"
  }, [difficulty])

  const resetGame = (level = difficulty) => {
    setCards(generateCards(level))
    setSelectedCards([])
    setMoves(0)
    setMatchedPairs(0)
    setSeconds(0)
    setIsRunning(false)
    setIsChecking(false)
  }

  useEffect(() => {
    resetGame(difficulty)
  }, [difficulty])

  useEffect(() => {
    if (!isRunning || hasWon) return

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, hasWon])

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
              c.icon === first.icon && (c.id === first.id || c.id === second.id)
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
    </section>
  )
}