const experiences = [
  {
    role: "Application Developer (Internship)",
    company: "PT Trans Retail Indonesia",
    period: "Apr 2025 – Apr 2026",
    desc: [
      "Develop and maintain web applications using React.js for frontend development",
      "Build backend functionality using PHP Native with MySQL database",
      "Design and implement new features using JavaScript",
      "Ensure system compatibility, data security, and performance optimization"
    ]
  },
  {
    role: "Business Executive (Insurance Agent)",
    company: "PT Allianz Life Indonesia",
    period: "Mar 2024 – Jan 2025",
    desc: [
      "Offered insurance products to potential customers",
      "Explained policy benefits and coverage to clients",
      "Provided consultation for financial protection planning"
    ]
  },
  {
    role: "Education Counselor (Part-time)",
    company: "Binus Admission",
    period: "Mar 2023 – Sep 2024",
    desc: [
      "Helped students plan their educational path",
      "Provided guidance in selecting study programs and majors",
      "Advised students regarding career opportunities"
    ]
  },
  {
    role: "Freshmen Leader & Partner (Volunteer)",
    company: "Bina Nusantara University",
    period: "Aug 2023 – Aug 2024",
    desc: [
      "Mentored new students during their first year at university",
      "Provided support for academic and personal challenges",
      "Encouraged involvement in campus activities and organizations"
    ]
  }
]

export default function Experience() {
  return (
    <section
      id="experience"
      className="py-24 max-w-5xl mx-auto px-6 scroll-mt-24"
    >
      <h2 className="text-3xl font-bold text-center mb-16">
        Experience
      </h2>

      {/* Timeline */}
      <div className="relative border-l border-zinc-700">

        {experiences.map((exp, index) => (
          <div key={index} className="mb-12 ml-6 relative">

            {/* Timeline Dot */}
            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full ring-8 ring-black"></span>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-blue-500 transition">

              <div className="flex justify-between flex-wrap mb-2">

                <h3 className="text-xl font-semibold text-white">
                  {exp.role}
                </h3>

                <span className="text-gray-400 text-sm">
                  {exp.period}
                </span>

              </div>

              <p className="text-blue-400 mb-4">
                {exp.company}
              </p>

              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {exp.desc.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

            </div>

          </div>
        ))}

      </div>
    </section>
  )
}
