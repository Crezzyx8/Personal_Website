import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
      <div className="max-w-[1800px] mx-auto px-8 py-5 flex items-center justify-between">
        <Link to="/" className="text-white font-bold text-2xl">
          Filbert Huang
        </Link>

        <div className="flex items-center gap-10 text-lg">
          <a href="#about" className="text-white/80 hover:text-white transition">
            About
          </a>
          <a href="#experience" className="text-white/80 hover:text-white transition">
            Experience
          </a>
          <a href="#projects" className="text-white/80 hover:text-white transition">
            Projects
          </a>
          <a href="#certificates" className="text-white/80 hover:text-white transition">
            Certificates
          </a>
          <a href="#contact" className="text-white/80 hover:text-white transition">
            Contact
          </a>

          <Link to="/games" className="text-white/80 hover:text-blue-400 transition">
            Games
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;