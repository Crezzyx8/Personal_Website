const experiences = [
  {
    role: "Application Developer (Internship)",
    company: "PT Trans Retail Indonesia",
    period: "Apr 2025 – Apr 2026",
    desc: [
      "Developed and maintained internal enterprise web applications using React.js and PHP, improving system usability and efficiency",
      "Built and integrated backend modules with MySQL, ensuring reliable data handling and optimized query performance",
      "Implemented new features and enhancements using JavaScript to improve user experience and system functionality",
      "Improved application performance and ensured system stability, security, and compatibility across internal tools"
    ]
  },
  {
    role: "Business Executive (Insurance Agent)",
    company: "PT Allianz Life Indonesia",
    period: "Mar 2024 – Jan 2025",
    desc: [
      "Consulted clients on insurance solutions, aligning products with customer needs and financial goals",
      "Explained policy benefits and coverage clearly to improve client understanding and trust",
      "Developed strong communication and persuasion skills through direct client engagement"
    ]
  },
  {
    role: "Education Counselor (Part-time)",
    company: "Binus Admission",
    period: "Mar 2023 – Sep 2024",
    desc: [
      "Guided prospective students in selecting suitable study programs based on interests and career goals",
      "Provided academic and career consultation to help students make informed decisions",
      "Strengthened interpersonal and problem-solving skills through direct student interaction"
    ]
  },
  {
    role: "Freshmen Leader & Partner (Volunteer)",
    company: "Bina Nusantara University",
    period: "Aug 2023 – Aug 2024",
    desc: [
      "Mentored new students during their transition into university life",
      "Provided academic and personal support in a dynamic campus environment",
      "Encouraged participation in campus activities and student organizations"
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

            {/* Dot */}
            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full ring-8 ring-black"></span>

            {/* Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 
              border border-zinc-800 p-6 rounded-xl 
              hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 
              transition">

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

              <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
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