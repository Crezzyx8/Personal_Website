const Projects = () => {
  return (
    <section id="projects" className="py-32 max-w-5xl mx-auto px-6 reveal">
      <h2 className="text-3xl font-bold mb-8">Projects</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-neutral-800 p-6 rounded-xl hover:border-blue-500 transition">
          <h3 className="font-semibold">Customer Churn AI</h3>
          <p className="text-neutral-400 mt-2">
            Machine learning model to predict customer churn with deployment-ready web interface.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Projects
