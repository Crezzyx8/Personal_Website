import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaDownload,
  FaMapMarkerAlt
} from "react-icons/fa"

import cv from "../assets/Filbert_Huang_CV.pdf"

export default function Contact() {
  return (
    <section id="contact" className="py-24 max-w-4xl mx-auto px-6">

      {/* Title */}
      <h2 className="text-3xl font-bold text-center mb-4">
        Contact
      </h2>

      {/* Subtitle */}
      <p className="text-center text-gray-400 mb-2">
        Feel free to reach out or connect with me.
      </p>

      {/* Location + Availability */}
      <div className="flex justify-center items-center gap-3 text-gray-500 text-sm mb-10">
        <FaMapMarkerAlt />
        Jakarta, Indonesia
        <span className="text-green-400">• Available for Internship opportunities and Full Time Positions</span>
      </div>


      {/* Contact Icons */}
      <div className="flex justify-center gap-16 flex-wrap">

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/filbert-huang-816a60297/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center group"
        >
          <FaLinkedin className="text-5xl text-gray-300 transition duration-300 group-hover:text-blue-500 group-hover:scale-110" />
          <span className="mt-3 text-sm text-gray-400 group-hover:text-white transition">
            LinkedIn
          </span>
        </a>


        {/* GitHub */}
        <a
          href="https://github.com/Crezzyx8"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center group"
        >
          <FaGithub className="text-5xl text-gray-300 transition duration-300 group-hover:text-white group-hover:scale-110" />
          <span className="mt-3 text-sm text-gray-400 group-hover:text-white transition">
            GitHub
          </span>
        </a>


        {/* Email */}
        <a
          href="mailto:filberthuangg@gmail.com"
          className="flex flex-col items-center group"
        >
          <FaEnvelope className="text-5xl text-gray-300 transition duration-300 group-hover:text-red-400 group-hover:scale-110" />
          <span className="mt-3 text-sm text-gray-400 group-hover:text-white transition">
            Email
          </span>
        </a>


        {/* Download CV */}
        <a
          href={cv}
          download
          className="flex flex-col items-center group"
        >
          <FaDownload className="text-5xl text-gray-300 transition duration-300 group-hover:text-green-400 group-hover:scale-110" />
          <span className="mt-3 text-sm text-gray-400 group-hover:text-white transition">
            Download CV
          </span>
        </a>

      </div>


      {/* Footer */}
      <p className="text-center text-gray-500 text-sm mt-16">
        © 2026 Filbert Huang. Built with React + Tailwind CSS
      </p>

    </section>
  )
}