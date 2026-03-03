import { useEffect, useState } from "react"

const roles = [
  "Filbert",
  "An AI Enthusiast",
  "An Backend Developer",
  "An Data Scientist Enthusiast",
  "An Data Analyst Enthusiast",
]

const Hero = () => {
  const [text, setText] = useState("")
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (index === roles.length) {
      setIndex(0)
    }

    if (subIndex === roles[index]?.length + 1 && !deleting) {
      setTimeout(() => setDeleting(true), 1000)
      return
    }

    if (subIndex === 0 && deleting) {
      setDeleting(false)
      setIndex(prev => (prev + 1) % roles.length)
      return
    }

    const timeout = setTimeout(() => {
      setSubIndex(prev => prev + (deleting ? -1 : 1))
    }, deleting ? 50 : 100)

    setText(roles[index]?.substring(0, subIndex))

    return () => clearTimeout(timeout)
  }, [subIndex, index, deleting])

  return (
    <section className="min-h-screen flex items-center justify-center text-center px-6">
      <div className="max-w-3xl">

        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Hi, I'm{" "}
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            {text}
            <span className="animate-pulse">|</span>
          </span>
        </h1>

        <p className="mt-6 text-neutral-400 text-lg">
          Passionate about building intelligent systems and modern web applications.
        </p>

        <div className="mt-10 flex justify-center gap-6">
          <a
            href="#projects"
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/30 hover:scale-105"
          >
            View Projects
          </a>

          <a
            href="#contact"
            className="px-8 py-3 rounded-xl border border-neutral-700 hover:border-blue-500 transition hover:scale-105"
          >
            Contact Me
          </a>
        </div>

      </div>
    </section>
  )
}

export default Hero
