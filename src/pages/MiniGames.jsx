import { Link } from "react-router-dom";
import TicTacToe from "../components/games/TicTacToe";

function MiniGames() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-black to-neutral-900 text-white px-6 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400 mb-5">
              Filbert Lab / Mini Games
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Mini <span className="text-blue-500">Games</span>
            </h1>

            <p className="text-gray-400 max-w-3xl text-lg leading-relaxed">
              A small collection of interactive browser games integrated into my
              personal website.
            </p>
          </div>

          <Link
            to="/"
            className="px-5 py-3 rounded-xl border border-white/10 hover:border-blue-500/40 hover:text-blue-400 transition"
          >
            ← Back to Home
          </Link>
        </div>

        <section className="mb-16">
          <TicTacToe />
        </section>

        <section>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Upcoming Games</h2>
          <p className="text-gray-400 mb-8">
            More lightweight games planned for the next phase.
          </p>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-white/10 bg-[#09090c] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold">2048</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Next
                </span>
              </div>
              <p className="text-gray-400">
                Sliding tile puzzle game with clean UI and score tracking.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#09090c] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold">Memory Match</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Planned
                </span>
              </div>
              <p className="text-gray-400">
                Card matching game themed around tech stack icons or portfolio assets.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#09090c] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold">Snake</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Planned
                </span>
              </div>
              <p className="text-gray-400">
                Classic arcade snake game with live score and increasing speed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default MiniGames;