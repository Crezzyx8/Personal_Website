import { useEffect, useRef } from "react"

const BackgroundEffects = () => {
  const glowRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    // ===== Mouse Glow =====
    const handleMouseMove = (e) => {
      if (glowRef.current) {
        glowRef.current.style.left = e.clientX + "px"
        glowRef.current.style.top = e.clientY + "px"
      }
    }

    window.addEventListener("mousemove", handleMouseMove)

    // ===== Particles =====
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "rgba(255,255,255,0.3)"

      particles.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <>
      <div ref={glowRef} className="mouse-glow" />
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      />
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
    </>
  )
}

export default BackgroundEffects
