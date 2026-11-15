import { useEffect } from "react"
import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import About from "../components/About"
import Experience from "../components/Experience"
import Projects from "../components/Projects"
import Certificates from "../components/Certificates"
import Contact from "../components/Contact"
import "./HomePage.css"

export default function HomePage() {
  useEffect(() => {
    const reveals = document.querySelectorAll(".portfolio-home .reveal")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active")
          }
        })
      },
      { threshold: 0.2 }
    )

    reveals.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="portfolio-home min-h-screen text-white">
      <div className="portfolio-backdrop" aria-hidden="true" />
      <Navbar />

      <main className="portfolio-content">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Certificates />
        <Contact />
      </main>
    </div>
  )
}