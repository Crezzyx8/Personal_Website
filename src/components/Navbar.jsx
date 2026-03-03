import { useState, useEffect } from "react"

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/70 backdrop-blur-xl border-b border-neutral-800"
          : "bg-transparent"
      }`}
    >
      {/* FULL WIDTH CONTAINER */}
      <div className="w-full px-12 py-6 flex justify-between items-center">
        
        {/* LOGO / NAME */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-white">
          Personal Website
        </h1>

        {/* MENU */}
        <div className="hidden md:flex items-center gap-12 text-base text-neutral-400">
          {["About", "Experience", "Projects", "Certificates", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="relative hover:text-white transition duration-300"
            >
              {item}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-500 transition-all duration-300 hover:w-full"></span>
            </a>
          ))}
        </div>

      </div>
    </nav>
  )
}

export default Navbar
