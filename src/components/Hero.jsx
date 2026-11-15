import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import profile from "../assets/profile.jpeg"

const roles = [
  "Full-Stack Developer",
  "Backend Developer",
  "Data Analyst",
  "Applied AI & ML Practitioner",
  "Database Engineer",
]

function useTypewriter() {
  const [text, setText] = useState(roles[0])

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let timer
    let index = 0
    let length = roles[0].length
    let deleting = true

    function tick() {
      const phrase = roles[index]
      length += deleting ? -1 : 1
      setText(phrase.slice(0, length))

      if (deleting && length === 0) {
        index = (index + 1) % roles.length
        deleting = false
        timer = setTimeout(tick, 280)
      } else if (!deleting && length === phrase.length) {
        deleting = true
        timer = setTimeout(tick, 2100)
      } else {
        timer = setTimeout(tick, deleting ? 32 : 62)
      }
    }

    function syncMotion() {
      clearTimeout(timer)
      index = 0
      length = roles[0].length
      deleting = true
      setText(roles[0])
      if (!motion.matches) timer = setTimeout(tick, 2200)
    }

    syncMotion()
    motion.addEventListener("change", syncMotion)
    return () => {
      clearTimeout(timer)
      motion.removeEventListener("change", syncMotion)
    }
  }, [])

  return text
}

export default function Hero() {
  const role = useTypewriter()

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 pb-12 pt-28 text-center sm:px-6 lg:px-16">
      <div className="portfolio-glass w-full max-w-[84rem] rounded-[2rem] px-5 py-10 sm:px-12 lg:px-20 lg:py-14">
        <img
          src={profile}
          alt="Filbert Huang"
          className="mx-auto mb-8 h-24 w-24 rounded-full border-4 border-white/15 object-cover md:h-32 md:w-32"
        />

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl">
          <span className="text-neutral-300">Hello,</span> I&apos;m Filbert
        </h1>

        <p className="portfolio-role mt-5 text-lg font-medium text-neutral-300 sm:text-2xl md:text-3xl">
          <span className="sr-only">{roles[0]}</span>
          <span aria-hidden="true">{role}<span className="portfolio-caret" /></span>
        </p>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-neutral-300 md:text-lg">
          Computer Science student specializing in Database Technology with
          hands-on experience in React.js, PHP, Node.js, Laravel and MySQL.
          Passionate about building scalable and efficient web applications,
          and experienced in data analysis and visualization using Python and SQL.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="#projects" className="rounded-xl bg-white px-7 py-3 font-semibold text-neutral-950 transition hover:bg-neutral-200">
            View Projects
          </a>
          <a href="#contact" className="rounded-xl border border-white/25 bg-white/5 px-7 py-3 transition hover:bg-white/15">
            Contact Me
          </a>
        </div>
      </div>

      <a href="#about" aria-label="Go to About" className="mt-5 rounded-full p-2 text-neutral-400 transition hover:text-white">
        <ChevronDown size={28} aria-hidden="true" />
      </a>
    </section>
  )
}
