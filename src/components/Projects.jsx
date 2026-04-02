import { useEffect, useState } from "react"
import { FaGithub } from "react-icons/fa"

export default function Projects() {

  const [repos, setRepos] = useState([])

  useEffect(() => {
    fetch("https://api.github.com/users/Crezzyx8/repos")
      .then(res => res.json())
      .then(data => {

        const sortedRepos = data
          .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0,15)

        setRepos(sortedRepos)
      })
  }, [])

  return (

    <section
      id="projects"
      className="py-24 max-w-6xl mx-auto px-6 scroll-mt-24"
    >

      <h2 className="text-3xl font-bold text-center mb-16">
        Projects
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

        {repos.map(repo => (

          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-blue-500 hover:-translate-y-2 transition duration-300"
          >

            {/* Repo Title */}
            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition">
              {repo.name}
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-6 min-h-[40px]">
              {repo.description || "No description provided"}
            </p>

            {/* Bottom Section */}
            <div className="flex justify-between items-center text-xs text-gray-500">

              <span className="bg-zinc-800 px-2 py-1 rounded">
                {repo.language || "Code"}
              </span>

              <div className="flex items-center gap-3">

                <span>
                   {repo.stargazers_count}
                </span>

                <FaGithub className="text-lg opacity-70 group-hover:opacity-100"/>

              </div>

            </div>

          </a>

        ))}

      </div>

    </section>
  )
}
