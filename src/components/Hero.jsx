import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import profile from "../assets/profile.jpeg"

const greetings = [
  "Hi",
  "Halo",
  "Hello",
  "你好",
  "안녕하세요",
  "こんにちは",
]

const roles = [
  "Full-Stack Developer (React, Node.js, Vue.js, PHP, Cypress)",
  "Backend Developer specializing in Laravel & Node.js",
  "Data Analyst specializing in SQL, Power BI & Python",
  "Applied AI & Machine Learning Practitioner",
  "Database Engineer (MySQL & SQL Server)",
]

const Hero = () => {
  const [greetText, setGreetText] = useState("")
  const [greetIndex, setGreetIndex] = useState(0)
  const [greetSub, setGreetSub] = useState(0)
  const [greetDeleting, setGreetDeleting] = useState(false)

  const [roleText, setRoleText] = useState("")
  const [roleIndex, setRoleIndex] = useState(0)
  const [roleSub, setRoleSub] = useState(0)
  const [roleDeleting, setRoleDeleting] = useState(false)

  useEffect(() => {
    let timeout

    if (greetSub === greetings[greetIndex].length && !greetDeleting) {
      timeout = setTimeout(() => setGreetDeleting(true), 1500)
    } else if (greetSub === 0 && greetDeleting) {
      setGreetDeleting(false)
      setGreetIndex((prev) => (prev + 1) % greetings.length)
    } else {
      timeout = setTimeout(() => {
        setGreetSub((prev) => prev + (greetDeleting ? -1 : 1))
      }, greetDeleting ? 40 : 80)
    }

    setGreetText(greetings[greetIndex].substring(0, greetSub))

    return () => clearTimeout(timeout)
  }, [greetSub, greetIndex, greetDeleting])

  useEffect(() => {
    let timeout

    if (roleSub === roles[roleIndex].length && !roleDeleting) {
      timeout = setTimeout(() => setRoleDeleting(true), 1200)
    } else if (roleSub === 0 && roleDeleting) {
      setRoleDeleting(false)
      setRoleIndex((prev) => (prev + 1) % roles.length)
    } else {
      timeout = setTimeout(() => {
        setRoleSub((prev) => prev + (roleDeleting ? -1 : 1))
      }, roleDeleting ? 30 : 60)
    }

    setRoleText(roles[roleIndex].substring(0, roleSub))

    return () => clearTimeout(timeout)
  }, [roleSub, roleIndex, roleDeleting])

  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 md:px-10 text-center relative pt-28 md:pt-32">

      <div className="max-w-5xl">

        {/* PROFILE */}
        <div className="mb-8 flex justify-center">
          <img
            src={profile}
            alt="profile"
            className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover border-4 border-neutral-800 shadow-lg"
          />
        </div>

        {/* 🔥 GREETING + NAME */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">
          <span className="text-blue-500">
            {greetText}
            <span className="animate-pulse">|</span>
          </span>{" "}
          I'm{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-white">
              Filbert
            </span>
            <span className="absolute inset-0 bg-blue-600/20 blur-2xl"></span>
          </span>
        </h1>

        {/* 🔥 ROLE (tetap ada) */}
        <h2 className="mt-6 text-xl sm:text-2xl md:text-3xl font-semibold text-blue-500 min-h-[40px]">
          {roleText}
          <span className="animate-pulse">|</span>
        </h2>

        {/* DESCRIPTION */}
        <p className="mt-8 text-neutral-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Computer Science student specializing in Database Technology with
          hands-on experience in React.js, PHP, Node.js, Laravel and MySQL.
          Passionate about building scalable and efficient web applications,
          and experienced in data analysis and visualization using Python and SQL.
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
            className="px-8 py-3 border border-neutral-700 hover:border-blue-500 hover:text-white transition rounded-xl hover:scale-105"
          >
            Contact Me
          </a>
        </div>

      </div>

      {/* SCROLL */}
      <div className="absolute bottom-10 animate-bounce text-neutral-500">
        <ChevronDown size={28} />
      </div>

    </section>
  )
}

export default Hero