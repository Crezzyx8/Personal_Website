const About = () => {
  return (
    <section
      id="about"
      className="py-32 max-w-5xl mx-auto px-6 reveal"
    >
      <h2 className="text-4xl font-bold mb-10 text-center">
        About Me
      </h2>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-xl">
        <p className="text-neutral-400 leading-relaxed text-lg">
          I specialize in machine learning, AI deployment, and modern frontend
          systems. I enjoy building scalable, data-driven applications with
          clean architecture and strong user experience.
        </p>
      </div>
    </section>
  )
}

export default About
