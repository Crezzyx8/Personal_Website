import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import About from "./components/About"
import Experience from "./components/Experience"
import Projects from "./components/Projects"
import Certificates from "./components/Certificates"
import Contact from "./components/Contact"
import { useEffect } from "react"


function App() {
  useEffect(() => {
  const reveals = document.querySelectorAll(".reveal")

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active")
      }
    })
  }, { threshold: 0.2 })

  reveals.forEach((el) => observer.observe(el))
}, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-black to-neutral-900 text-white">
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Certificates />
      <Contact />
    </div>
  )
}

export default App
