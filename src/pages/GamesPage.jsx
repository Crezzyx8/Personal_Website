import { useState } from "react"
import { Link } from "react-router-dom"
import TicTacToe from "../components/Games/TicTacToe"
import MemoryGame from "../components/Games/MemoryGame"

const games = [
  {
    key: "tictactoe",
    title: "Tic Tac Toe",
    desc: "Dynamic board, bot AI, match mode, round history, and polished gameplay.",
    badge: "Available",
  },
  {
    key: "memory",
    title: "Memory Match",
    desc: "Flip cards, match pairs, beat the timer, and clear the board.",
    badge: "New",
  },
]

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState(null)

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-black to-neutral-900 text-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between mb-10">
          <div>
            <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
              Filbert Lab / Mini Games
            </span>

            <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
              Mini <span className="text-blue-500">Games</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-400 leading-relaxed">
              A small collection of interactive browser games integrated into my personal website.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-white hover:border-blue-500/40 hover:bg-zinc-900 transition"
          >
            ← Back to Home
          </Link>
        </div>

        {!selectedGame && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {games.map((game) => (
                <button
                  key={game.key}
                  onClick={() => setSelectedGame(game.key)}
                  className="group text-left rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 hover:border-blue-500/40 hover:bg-zinc-900 transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-semibold text-white group-hover:text-blue-400 transition">
                      {game.title}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        game.badge === "New"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                      }`}
                    >
                      {game.badge}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                    {game.desc}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm text-blue-400">
                    Play now
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-14">
              <h2 className="text-2xl font-bold text-white mb-3">Upcoming Games</h2>
              <p className="text-sm text-gray-400 mb-6">
                More lightweight games planned for the next phase.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["2048", "Snake", "Reaction Test"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-5"
                  >
                    <p className="text-white font-medium">{item}</p>
                    <p className="text-xs text-gray-500 mt-2">Planned</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedGame && (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-white hover:border-blue-500/40 hover:bg-zinc-900 transition"
            >
              ← Back to Games
            </button>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-3 sm:p-5">
              {selectedGame === "tictactoe" && <TicTacToe />}
              {selectedGame === "memory" && <MemoryGame />}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}