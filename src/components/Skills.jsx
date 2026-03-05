export default function Skills(){

const skills = [
  {name:"React",level:80},
  {name:"JavaScript",level:85},
  {name:"Python",level:80},
  {name:"SQL",level:85},
  {name:"PHP",level:70},
  {name:"Java",level:70},
  {name:"HTML & CSS",level:90},
  {name:"Node.js",level:70},
]

return(

<section id="skills" className="py-24 max-w-4xl mx-auto px-6">

<h2 className="text-3xl font-bold text-center mb-16">
Skills
</h2>

<div className="space-y-6">

{skills.map(skill => (

<div key={skill.name}>

<div className="flex justify-between mb-1">
<span>{skill.name}</span>
<span>{skill.level}%</span>
</div>

<div className="w-full bg-zinc-800 h-2 rounded">

<div
className="bg-blue-500 h-2 rounded"
style={{width:`${skill.level}%`}}
/>

</div>

</div>

))}

</div>

</section>

)
}
