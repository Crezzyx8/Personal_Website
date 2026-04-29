import profile from "../assets/profile.jpeg"
import {
  FaReact,
  FaNodeJs,
  FaPython,
  FaHtml5,
  FaCss3Alt,
  FaPhp,
  FaJava,
} from "react-icons/fa"

import {
  SiMysql,
  SiJavascript,
  SiTypescript,
  SiTailwindcss,
  SiCypress,
  SiFigma,
  SiPostman,
  SiCanva,
  SiR,
  SiC,
} from "react-icons/si"

export default function About() {

  // 🔥 PRIMARY (highlight)
  const primarySkills = [
    { name: "React", icon: <FaReact /> },
    { name: "Node.js", icon: <FaNodeJs /> },
    { name: "SQL", icon: <SiMysql /> },
    { name: "Python", icon: <FaPython /> },
  ]

  // ⚪ SECONDARY (lebih subtle)
  const secondarySkills = [
    { name: "JavaScript", icon: <SiJavascript /> },
    { name: "TypeScript", icon: <SiTypescript /> },
    { name: "HTML", icon: <FaHtml5 /> },
    { name: "CSS", icon: <FaCss3Alt /> },
    { name: "PHP", icon: <FaPhp /> },
    { name: "Java", icon: <FaJava /> },
    { name: "C", icon: <SiC /> },
    { name: "R", icon: <SiR /> },
    { name: "Tailwind", icon: <SiTailwindcss /> },
    { name: "Cypress", icon: <SiCypress /> },
    { name: "Postman", icon: <SiPostman /> },
    { name: "Figma", icon: <SiFigma /> },
    { name: "Canva", icon: <SiCanva /> },
  ]

  return (
    <section
      id="about"
      className="py-24 max-w-6xl mx-auto px-6 scroll-mt-24"
    >

      {/* TITLE */}
      <h2 className="text-3xl font-bold text-center">
        About Me
      </h2>

      <div className="grid md:grid-cols-2 gap-12 items-center mt-16">

        {/* IMAGE */}
        <div className="flex justify-center">
          <img
            src={profile}
            alt="profile"
            className="w-64 h-64 object-cover rounded-full border border-zinc-800 shadow-lg"
          />
        </div>

        {/* CONTENT */}
        <div>

          {/* ABOUT TEXT */}
          <p className="text-gray-300 leading-relaxed mb-6">
            Computer Science student at Bina Nusantara University specializing in 
            Database Technology, with hands-on experience in building and maintaining 
            scalable enterprise web applications. Experienced in developing full-stack 
            systems using React.js, PHP, and MySQL, with a strong focus on performance, 
            system reliability, and clean architecture.
          </p>

          <p className="text-gray-300 leading-relaxed mb-6">
            Previously worked as an Application Developer Intern, contributing to 
            internal systems such as POS configuration tools, CMS platforms, and 
            automation systems. Involved in feature development, performance 
            optimization, and efficient data processing.
          </p>

          <p className="text-gray-300 leading-relaxed mb-10">
            Also experienced in communication-driven roles, strengthening 
            problem-solving, adaptability, and stakeholder communication skills.
          </p>

          {/* 🔥 PRIMARY SKILLS */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Core Skills
            </h3>

            <div className="flex flex-wrap gap-4">

              {primarySkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 
                  bg-blue-600/10 border border-blue-500/30 
                  rounded-lg text-blue-400 font-medium
                  hover:scale-105 transition"
                >
                  <span className="text-lg">
                    {skill.icon}
                  </span>
                  {skill.name}
                </div>
              ))}

            </div>
          </div>

          {/* ⚪ SECONDARY SKILLS */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-400">
              Other Tools & Technologies
            </h3>

            <div className="flex flex-wrap gap-3">

              {secondarySkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 
                  bg-zinc-900 border border-zinc-800 
                  rounded-md text-sm text-gray-400
                  hover:border-blue-500 hover:text-white 
                  transition"
                >
                  <span className="text-base">
                    {skill.icon}
                  </span>
                  {skill.name}
                </div>
              ))}

            </div>
          </div>

        </div>

      </div>

    </section>
  )
}