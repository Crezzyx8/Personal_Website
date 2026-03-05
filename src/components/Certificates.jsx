import { useState } from "react"

import backend from "../assets/Backend.jpg"
import cloud from "../assets/cloudcomputing.jpg"
import ibm from "../assets/IBM.png"
import js from "../assets/js.jpg"
import python from "../assets/Python.jpg"
import sql from "../assets/SQL.jpg"
import BigData from "../assets/BigData.jpg"


const certificates = [
  {
    title: "Backend Development",
    image: backend,
  },
  {
    title: "Cloud Computing",
    image: cloud,
  },
  {
    title: "IBM Certification",
    image: ibm,
  },
  {
    title: "JavaScript Certification",
    image: js,
  },
  {
    title: "Python Certification",
    image: python,
  },
  {
    title: "SQL Certification",
    image: sql,
  },
  {
    title: "Big Data",
    image: BigData,
  },

]

const Certificates = () => {
  const [selected, setSelected] = useState(null)

  return (
    <section id="certificates" className="py-32 border-t border-neutral-800">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-16">Certificates</h2>

        <div className="grid md:grid-cols-3 gap-10">
  {certificates.map((cert, i) => (
      <div
        key={i}
        onClick={() => setSelected(cert.image)}
        className="cursor-pointer bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-blue-500 transition group fade-up"
        style={{ animationDelay: `${i * 0.15}s` }}
      >
        <div className="overflow-hidden">
          <img
            src={cert.image}
            alt={cert.title}
            className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
          />
        </div>

        <div className="p-6">
          <h3 className="text-sm font-medium text-neutral-300">
            {cert.title}
          </h3>
        </div>
      </div>
    ))}
  </div>

        </div>

      {/* Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
        >
          <img
            src={selected}
            alt="Certificate"
            className="max-h-[90vh] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </section>
  )
}

export default Certificates
