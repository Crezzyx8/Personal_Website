export default function About() {
  return (
    <section id="about" className="py-24 max-w-5xl mx-auto px-6">

      <h2 className="text-3xl font-bold text-center mb-10">
        About Me
      </h2>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-gray-300 leading-relaxed">

        <p className="mb-6">
          I am a Computer Science student at Bina Nusantara University with a specialization in Database Technology.
          I have experience in marketing, education counseling, and software development, which has helped me build
          both technical and communication skills.
        </p>

        <p className="mb-6">
          Currently, I am working as an Application Developer Intern where I develop and maintain web applications
          using React.js for the frontend and PHP(Laravel Framework) with MySQL & Postgre for backend systems. I focus on building efficient,
          secure, and scalable web solutions.
        </p>

        <p>
          I am passionate about building intelligent systems, exploring data science, and developing modern web
          applications that solve real-world problems.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10 text-sm">

          <div className="bg-zinc-800 p-4 rounded-lg text-center">
            Computer Science
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg text-center">
            Fullstack Developer
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg text-center">
            Data Analyst & Scientist
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg text-center">
            Public Speaking
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg text-center">
            Teamwork
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg text-center">
            Adaptability
          </div>

        </div>

      </div>

    </section>
  )
}
