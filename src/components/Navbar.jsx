import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ChevronDown, Menu, X } from "lucide-react"

const navItems = [
  { label: "About", id: "about", type: "section" },
  { label: "Experience", id: "experience", type: "section" },
  { label: "Projects", id: "projects", type: "section" },
  { label: "Certificates", id: "certificates", type: "section" },
  { label: "Contact", id: "contact", type: "section" },
  { label: "Games", path: "/games", type: "route" },
]

function WorkspaceMenu({ mobile = false, onNavigate }) {
  const location = useLocation()
  const officeActive = location.pathname === "/ai-office"
  const linkClass = officeActive
    ? "bg-white/10 text-white"
    : "text-white/85 hover:bg-white/10 hover:text-white"

  return (
    <details className="group relative" key={location.pathname}>
      <summary className={`flex cursor-pointer list-none items-center gap-2 text-sm font-medium hover:text-white focus-visible:outline focus-visible:outline-white [&::-webkit-details-marker]:hidden ${mobile ? "rounded-xl px-4 py-3" : "lg:text-base"} ${officeActive ? "text-white" : "text-white/85"}`}>
        Workspace
        <ChevronDown size={15} aria-hidden="true" className="transition-transform group-open:rotate-180" />
      </summary>
      <div className={mobile
        ? "ml-4 border-l border-white/15 pl-2"
        : "absolute right-0 top-full mt-3 w-52 rounded-xl border border-white/15 bg-zinc-950 p-1.5 shadow-xl"}>
        <Link
          to="/ai-office"
          aria-current={officeActive ? "page" : undefined}
          onClick={onNavigate}
          className={`block rounded-lg px-3 py-2.5 text-sm font-medium focus-visible:outline focus-visible:outline-white ${linkClass}`}
        >
          Agentic AI Office
        </Link>
      </div>
    </details>
  )
}

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
      className={`portfolio-nav fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
          : "border-b border-white/10 bg-black/55 backdrop-blur-md"
      }`}
    >
      <div className="flex h-[4.5rem] w-full items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 whitespace-nowrap text-xl font-bold tracking-tight text-white md:text-2xl"
        >
          Filbert Huang
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Portfolio navigation" className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navItems.map((item) => {
            if (item.type === "route") {
              const active = isRouteActive(item.path)

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`relative text-sm lg:text-base font-medium transition ${
                    active ? "text-white" : "text-white/85 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-2 left-0 h-[2px] rounded-full bg-white transition-all duration-300 ${
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
                  active ? "text-white" : "text-white/85 hover:text-white"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-2 left-0 h-[2px] rounded-full bg-white transition-all duration-300 ${
                    active ? "w-full" : "w-0"
                  }`}
                />
              </button>
            )
          })}
          <WorkspaceMenu />
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 lg:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle Menu"
          aria-expanded={menuOpen}
          aria-controls="portfolio-mobile-nav"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <nav
        id="portfolio-mobile-nav"
        aria-label="Mobile portfolio navigation"
        className={`${menuOpen ? "block" : "hidden"} max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/10 bg-black/95 backdrop-blur-xl lg:hidden`}
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
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
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
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            )
          })}
          <WorkspaceMenu mobile onNavigate={() => setMenuOpen(false)} />
        </div>
      </nav>
    </header>
  )
}

export default Navbar
