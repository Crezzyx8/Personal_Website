import profile from "../assets/profile.jpeg"

export default function About() {

  const skills = [
    "React.js",
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "Tailwind",
    "PHP",
    "Laravel",
    "MySQL",
    "Python",
    "Java",
    "C",
    "Cypress",
    "GitLab/GitHub",
    "Figma",
    "Trello",
    "Canva",
  ]

  return (
    <section
      id="about"
      className="py-24 max-w-6xl mx-auto px-6 scroll-mt-24"
    >

      {/* Section Title */}
      <h2 className="text-3xl font-bold text-center">
        About Me
      </h2>

      {/* Subtitle */}
      <p className="text-center text-gray-400 mb-16 mt-2">
      </p>


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
            I am a Computer Science student specializing in Database Technology 
            at Bina Nusantara University with strong experience in building 
            scalable web-based enterprise applications. I focus on developing 
            efficient systems using modern technologies such as React.js, 
            Node.js, PHP, Laravel, and MySQL.
          </p>

          <p className="text-gray-300 leading-relaxed mb-8">
            Currently working as an Application Developer Intern at PT Trans 
            Retail Indonesia, where I contribute to the development and 
            maintenance of internal enterprise systems including POS 
            configuration tools, HCM modules, CMS platforms, Grab integration 
            services, and legal document alert automation systems.
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
                  className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg text-sm hover:border-blue-500 hover:shadow-blue-500/20 hover:shadow-md transition"
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