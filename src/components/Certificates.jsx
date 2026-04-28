import { useState } from "react"

import backend from "../assets/Backend.jpg"
import cloud from "../assets/cloudcomputing.jpg"
import ibm from "../assets/IBM.png"
import js from "../assets/js.jpg"
import python from "../assets/Python.jpg"
import sql from "../assets/SQL.jpg"
import BigData from "../assets/BigData.jpg"
import microsoftfabric from "../assets/Fabric.jpeg"
import machinelearning from "../assets/machinelearning.jpg"
import Hive from "../assets/Data Using Hive.png"
import kiro from "../assets/spec_kiropng.png"
import DS from "../assets/BelajarDasarDataScience.jpeg"
import SQL from "../assets/BelajarDasarSQL.jpeg"

const certificates = [
  { title: "Backend Development", image: backend },
  { title: "Cloud Computing", image: cloud },
  { title: "IBM Certification", image: ibm },
  { title: "JavaScript Certification", image: js },
  { title: "Python Certification", image: python },
  { title: "SQL Certification", image: sql },
  { title: "Big Data", image: BigData },
  { title: "Microsoft Fabric", image: microsoftfabric },
  { title: "Machine Learning", image: machinelearning },
  {title: "Data Using Hive", image: Hive},
  {title: "Spec Development With Kiro", image: kiro},
  {title: "Belajar Dasar SQL", image: SQL},
  {title: "Belajar Dasar Data Science", image: DS},
]

export default function Certificates() {

  const [selected, setSelected] = useState(null)

  return (

    <section
      id="certificates"
      className="py-28 border-t border-neutral-800 scroll-mt-24"
    >

      <div className="max-w-6xl mx-auto px-6">

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Certificates
        </h2>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">

          {certificates.map((cert, i) => (

            <div
              key={i}
              onClick={() => setSelected(cert.image)}
              className="cursor-pointer bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-blue-500 transition group"
            >

              <div className="overflow-hidden">

                <img
                  src={cert.image}
                  alt={cert.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                />

              </div>

              <div className="p-5">

                <h3 className="text-sm font-medium text-neutral-300 text-center">
                  {cert.title}
                </h3>

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* Modal Preview */}
      {selected && (

        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6"
        >

          <div className="relative max-w-5xl w-full flex justify-center">

            {/* Close Button */}
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-10 right-0 text-white text-xl"
            >
              ✕
            </button>

            <img
              src={selected}
              alt="Certificate"
              className="max-h-[90vh] rounded-xl shadow-2xl"
            />

          </div>

        </div>

      )}

    </section>
  )
}
