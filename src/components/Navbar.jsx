import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const menu = ["About", "Experience", "Projects", "Certificates", "Contact"]

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/70 backdrop-blur-xl border-b border-neutral-800"
          : "bg-transparent"
      }`}
    >
      <div className="w-full px-6 md:px-12 py-5 flex justify-between items-center">

        {/* LOGO */}
        <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white">
          Filbert Huang Personal Portfolio Website
        </h1>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-10 text-neutral-400">
          {menu.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="relative hover:text-white transition"
            >
              {item}
            </a>
          ))}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>

      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-black/95 border-t border-neutral-800">
          <div className="flex flex-col items-center gap-6 py-8 text-neutral-300">
            {menu.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setOpen(false)}
                className="hover:text-white transition"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar