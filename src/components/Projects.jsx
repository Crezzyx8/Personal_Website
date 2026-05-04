import { FaGithub, FaExternalLinkAlt } from "react-icons/fa"

const projects = [
  {
    title: "Customer Churn AI",
    category: "Machine Learning",
    impact: "Built predictive model to identify customer churn patterns",
    description: "Implemented machine learning algorithms and data preprocessing techniques to analyze customer retention behavior.",
    tech: "Python, Pandas, Scikit-learn",
    link: "https://github.com/Crezzyx8/customer-churn-ai"
  },
  {
    title: "Customer Lifetime Value Prediction",
    category: "Data Science",
    impact: "Predicted long-term customer value for business decision making",
    description: "Analyzed customer transaction data and built predictive models to estimate lifetime value.",
    tech: "Python, Regression Models",
    link: "https://github.com/Crezzyx8/CustomerLifetimePredictionValue"
  },
  {
    title: "Brand Performance Analyst",
    category: "Data Analytics",
    impact: "Analyzed brand performance metrics for business insights",
    description: "Processed and visualized data to evaluate brand growth and performance trends.",
    tech: "Python, Data Visualization",
    link: "https://github.com/Crezzyx8/Brand_Performance_Analyst"
  },
  {
    title: "Crypto Investment Analysis",
    category: "Data Analytics",
    impact: "Analyzed cryptocurrency trends for investment insights",
    description: "Explored crypto datasets and built analysis models to identify potential investment opportunities.",
    tech: "Python, Time Series Analysis",
    link: "https://github.com/Crezzyx8/crypto-investment-analysis"
  },
  {
    title: "Deep Learning Project",
    category: "AI / Deep Learning",
    impact: "Implemented deep learning models for predictive tasks",
    description: "Built neural network models and experimented with training techniques for improved accuracy.",
    tech: "Python, TensorFlow / PyTorch",
    link: "https://github.com/Crezzyx8/Deep_Learning"
  },
  {
    title: "Personal Portfolio Website",
    category: "Frontend",
    impact: "Designed and developed responsive personal portfolio",
    description: "Built modern UI portfolio using React with responsive design and animations.",
    tech: "React, Tailwind CSS",
    link: "https://github.com/Crezzyx8/Personal_Website"
  }
]

export default function Projects() {
  return (
    <section
      id="projects"
      className="py-24 max-w-6xl mx-auto px-6 scroll-mt-24"
    >

      {/* TITLE */}
      <h2 className="text-3xl font-bold text-center mb-4">
        Featured Projects
      </h2>

      <p className="text-center text-gray-400 mb-16">
        Selected work across machine learning, data analytics, and software development
      </p>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-8">

        {projects.map((project, index) => (

          <a
            key={index}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-zinc-900 to-zinc-800 
            border border-zinc-800 p-6 rounded-xl 
            hover:border-blue-500 hover:-translate-y-2 
            hover:shadow-lg hover:shadow-blue-500/10 
            transition duration-300"
          >

            {/* CATEGORY */}
            <span className="text-xs text-blue-400 font-medium uppercase tracking-wider">
              {project.category}
            </span>

            {/* TITLE */}
            <h3 className="text-xl font-semibold mt-2 mb-3 group-hover:text-blue-400 transition">
              {project.title}
            </h3>

            {/* IMPACT */}
            <p className="text-gray-300 text-sm mb-4">
              {project.impact}
            </p>

            {/* DESCRIPTION */}
            <p className="text-gray-500 text-sm mb-6">
              {project.description}
            </p>

            {/* TECH */}
            <div className="text-xs text-gray-400 mb-4">
              {project.tech}
            </div>

            {/* FOOTER */}
            <div className="flex justify-end items-center gap-3 text-gray-400">
              <FaGithub className="text-lg" />
              <FaExternalLinkAlt className="text-sm opacity-70" />
            </div>

          </a>

        ))}

      </div>

    </section>
  )
}