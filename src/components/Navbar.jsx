import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"

const navItems = [
  { label: "About", id: "about", type: "section" },
  { label: "Experience", id: "experience", type: "section" },
  { label: "Projects", id: "projects", type: "section" },
  { label: "Certificates", id: "certificates", type: "section" },
  { label: "Contact", id: "contact", type: "section" },
  { label: "Games", path: "/games", type: "route" },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [scrolled, setScrolled] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  // navbar background pas scroll
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // detect active section di homepage
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("")
      return
    }

    const sectionIds = ["about", "experience", "projects", "certificates", "contact"]

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: 0.1,
      }
    )

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [location.pathname])

  const handleSectionClick = async (sectionId) => {
    setMenuOpen(false)

    if (location.pathname !== "/") {
      navigate("/")
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 150)
      return
    }

    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const isRouteActive = (path) => location.pathname === path

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
          : "border-b border-white/10 bg-black/55 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="text-xl md:text-2xl font-bold tracking-tight text-white whitespace-nowrap"
        >
          Filbert Huang
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-10">
          {navItems.map((item) => {
            if (item.type === "route") {
              const active = isRouteActive(item.path)

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`relative text-sm lg:text-base font-medium transition ${
                    active ? "text-blue-400" : "text-white/85 hover:text-blue-400"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-2 left-0 h-[2px] rounded-full bg-blue-400 transition-all duration-300 ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              )
            }

            const active = activeSection === item.id && location.pathname === "/"

            return (
              <button
                key={item.label}
                onClick={() => handleSectionClick(item.id)}
                className={`relative text-sm lg:text-base font-medium transition ${
                  active ? "text-blue-400" : "text-white/85 hover:text-blue-400"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-2 left-0 h-[2px] rounded-full bg-blue-400 transition-all duration-300 ${
                    active ? "w-full" : "w-0"
                  }`}
                />
              </button>
            )
          })}
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[500px] border-t border-white/10" : "max-h-0"
        } bg-black/95 backdrop-blur-xl`}
      >
        <div className="px-4 py-4 flex flex-col gap-2">
          {navItems.map((item) => {
            if (item.type === "route") {
              const active = isRouteActive(item.path)

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      : "text-white/85 hover:bg-white/10 hover:text-blue-400"
                  }`}
                >
                  {item.label}
                </Link>
              )
            }

            const active = activeSection === item.id && location.pathname === "/"

            return (
              <button
                key={item.label}
                onClick={() => handleSectionClick(item.id)}
                className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                    : "text-white/85 hover:bg-white/10 hover:text-blue-400"
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}

export default Navbar