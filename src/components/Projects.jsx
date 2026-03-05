const Projects = () => {
  return (
    <section id="projects" className="py-32 border-t border-neutral-800">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-4xl font-bold mb-16">Projects</h2>

    <div className="grid md:grid-cols-3 gap-8">

      <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 hover:border-blue-500 transition">
        <h3 className="text-xl font-semibold mb-4">Customer Churn AI</h3>
        <p className="text-neutral-400 text-sm">
          Machine learning model to predict customer churn using Python and Streamlit.
        </p>
      </div>

      <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 hover:border-blue-500 transition">
        <h3 className="text-xl font-semibold mb-4">Personal Portfolio</h3>
        <p className="text-neutral-400 text-sm">
          Modern responsive website built using React.js and Tailwind CSS.
        </p>
      </div>

      <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 hover:border-blue-500 transition">
        <h3 className="text-xl font-semibold mb-4">Database Management App</h3>
        <p className="text-neutral-400 text-sm">
          CRUD web application using PHP and MySQL.
        </p>
      </div>

    </div>
  </div>
</section>

  )
}

export default Projects
