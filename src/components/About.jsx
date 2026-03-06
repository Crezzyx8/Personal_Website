import profile from "../assets/profile.jpeg"

export default function About() {

  const skills = [
    "React.js",
    "JavaScript",
    "PHP",
    "MySQL",
    "HTML",
    "CSS",
    "Tailwind",
    "Typescript",
    "Laravel",
    "GitLab/GitHub",
    "C",
    "Python",
    "Java",
    "Cypress",
    "Trello",
    "Canva",
    "Figma",
  ]

  return (
    <section
      id="about"
      className="py-24 max-w-6xl mx-auto px-6 scroll-mt-24"
    >

      <h2 className="text-3xl font-bold text-center mb-16">
        About
      </h2>

      <div className="grid md:grid-cols-2 gap-12 items-center">

        {/* Profile Image */}
        <div className="flex justify-center">
          <img
            src={profile}
            alt="profile"
            className="w-64 h-64 object-cover rounded-full border border-zinc-800 shadow-lg"
          />
        </div>

        {/* About Text */}
        <div>

          <p className="text-gray-300 leading-relaxed mb-6">
            I am an Computer Science student at Bina Nusantara University
            with a strong interest in software development and technology.
            I enjoy building web applications and learning modern tools
            that improve system performance, usability, and scalability.
          </p>

          <p className="text-gray-300 leading-relaxed mb-8">
            Currently working as an Application Developer Intern at
            PT Trans Retail Indonesia where I develop and maintain
            internal web applications using React.js, PHP, and MySQL.
          </p>

          {/* Skills */}
          <div>

            <h3 className="text-lg font-semibold mb-4">
              Tech Stack
            </h3>

            <div className="flex flex-wrap gap-3">

              {skills.map((skill, index) => (

                <span
                  key={index}
                  className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg text-sm hover:border-blue-500 transition"
                >
                  {skill}
                </span>

              ))}

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}
