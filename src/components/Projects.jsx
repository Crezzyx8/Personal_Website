import { useEffect, useState } from "react"

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

    <section id="projects" className="py-24 max-w-6xl mx-auto px-6">

      <h2 className="text-3xl font-bold text-center mb-16">
        Projects
      </h2>

      <div className="grid md:grid-cols-3 gap-8">

        {repos.map(repo => (

          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-blue-500 hover:scale-105 transition duration-300"
          >

            <h3 className="text-lg font-semibold mb-2">
              {repo.name}
            </h3>

            <p className="text-gray-400 text-sm mb-4">
              {repo.description || "No description provided"}
            </p>

            <div className="flex justify-between text-xs text-gray-500">

              <span>
                {repo.language || "Code"}
              </span>

              <span>
                ⭐ {repo.stargazers_count}
              </span>

            </div>

          </a>

        ))}

      </div>

    </section>

  )
}
