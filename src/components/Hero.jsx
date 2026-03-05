import { useEffect, useState } from "react"

const roles = [
  "An Full Stack Developer",
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
    if (subIndex === roles[index].length + 1 && !deleting) {
      setTimeout(() => setDeleting(true), 1200)
      return
    }

    if (subIndex === 0 && deleting) {
      setDeleting(false)
      setIndex((prev) => (prev + 1) % roles.length)
      return
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1))
    }, deleting ? 40 : 70)

    setText(roles[index].substring(0, subIndex))

    return () => clearTimeout(timeout)
  }, [subIndex, index, deleting])

  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 text-center">

      <div className="max-w-5xl">

        {/* NAME */}
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
          Hi, I'm{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-white">
              Filbert
            </span>
            <span className="absolute inset-0 bg-blue-600/10 blur-2xl"></span>
          </span>
        </h1>

        {/* TYPING ROLE */}
        <h2 className="mt-6 text-2xl md:text-3xl font-semibold text-blue-500 min-h-[40px]">
          {text}
          <span className="animate-pulse">|</span>
        </h2>

        {/* DESCRIPTION */}
        <p className="mt-8 text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Computer Science student specializing in Database Technology with
          hands-on experience in React.js, PHP, and MySQL.
          Passionate about building scalable and efficient web applications.
        </p>

        {/* BUTTONS */}
        <div className="mt-12 flex justify-center gap-6 flex-wrap">
          <a
            href="#projects"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl shadow-lg shadow-blue-600/20 hover:scale-105"
          >
            View Projects
          </a>

          <a
            href="#contact"
            className="px-8 py-3 border border-neutral-700 hover:border-blue-500 transition rounded-xl hover:scale-105"
          >
            Contact Me
          </a>
        </div>

        {/* TECH STACK MINI BADGES */}
        <div className="mt-14 flex flex-wrap justify-center gap-4 text-sm text-neutral-400">
          {["React", "PHP", "MySQL", "JavaScript", "Python", "HTML","CSS","Trello","Canva","TypeScript","Laravel"].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full hover:border-blue-500 transition"
            >
              {tech}
            </span>
          ))}
        </div>

      </div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-10 animate-bounce text-neutral-600 text-sm">
        Scroll Down
      </div>

    </section>
  )
}

export default Hero
