import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

const agents = [
  { name: "Producer", color: "#f59e0b", x: -4.8, z: -2.2 },
  { name: "Clip Strategist", color: "#3b82f6", x: -1.7, z: -2.2 },
  { name: "Video Editor", color: "#10b981", x: 1.4, z: -2.2 },
  { name: "Content Reviewer", color: "#8b5cf6", x: -4.8, z: 0.5 },
  { name: "Technical Reviewer", color: "#ec4899", x: -1.7, z: 0.5 },
  { name: "Publisher", color: "#14b8a6", x: 1.4, z: 0.5 },
]

export default function OfficeScene() {
  const containerRef = useRef(null)
  const resetRef = useRef(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      })
    } catch {
      setError(
        "WebGL tidak tersedia. Periksa hardware acceleration browser."
      )
      return
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#f1f5fb")

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const canvas = renderer.domElement
    canvas.style.display = "block"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.touchAction = "none"
    canvas.setAttribute(
      "aria-label",
      "Kantor virtual 3D dengan enam karakter bekerja"
    )
    container.appendChild(canvas)

    const camera = new THREE.OrthographicCamera(
      -12, 12, 8, -8, 0.1, 100
    )
    camera.position.set(17, 15, 19)

    const controls = new OrbitControls(camera, canvas)
    controls.target.set(0, 0.8, 0)
    controls.enablePan = false
    controls.minZoom = 0.65
    controls.maxZoom = 2.3
    controls.minPolarAngle = Math.PI / 6
    controls.maxPolarAngle = Math.PI / 2.35
    controls.update()
    controls.saveState()

    resetRef.current = () => controls.reset()

    const geometries = new Set()
    const materials = new Set()
    const textures = new Set()
    const animatedAgents = []

    function material(color, options = {}) {
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.8,
        ...options,
      })
      materials.add(mat)
      return mat
    }

    function mesh(geometry, mat, x, y, z, parent = scene) {
      geometries.add(geometry)
      const object = new THREE.Mesh(geometry, mat)
      object.position.set(x, y, z)
      object.castShadow = true
      object.receiveShadow = true
      parent.add(object)
      return object
    }

    function box(w, h, d, x, y, z, mat, parent = scene) {
      return mesh(
        new THREE.BoxGeometry(w, h, d),
        mat,
        x, y, z,
        parent
      )
    }

    function cylinder(rt, rb, h, x, y, z, mat, parent = scene) {
      return mesh(
        new THREE.CylinderGeometry(rt, rb, h, 14),
        mat,
        x, y, z,
        parent
      )
    }

    function sphere(radius, x, y, z, mat, parent = scene) {
      return mesh(
        new THREE.SphereGeometry(radius, 16, 12),
        mat,
        x, y, z,
        parent
      )
    }

    const palette = {
      wall: material("#d9d7cc"),
      trim: material("#b7b3a6"),
      wood: material("#896747"),
      darkWood: material("#59412f"),
      metal: material("#303b45"),
      screen: material("#172b3d"),
      chair: material("#384751"),
      skin: material("#dbad8b"),
      hair: material("#302b2a"),
      green: material("#64865b"),
      pot: material("#b6a98e"),
      sofa: material("#b2b7a7"),
      white: material("#faf6e9"),
      window: material("#b8d9ed", {
        emissive: "#6f9fb9",
        emissiveIntensity: 0.15,
      }),
      glass: material("#b7d9e2", {
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    }

    function label(text, color, x, y, z) {
      const image = document.createElement("canvas")
      image.width = 640
      image.height = 100

      const ctx = image.getContext("2d")
      if (!ctx) return

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(0, 0, 640, 100, 45)
      ctx.fill()

      ctx.font = "600 34px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#ffffff"
      ctx.fillText(text, 320, 52)

      const texture = new THREE.CanvasTexture(image)
      texture.colorSpace = THREE.SRGBColorSpace
      textures.add(texture)

      const mat = new THREE.SpriteMaterial({
        map: texture,
        depthTest: false,
      })
      materials.add(mat)

      const sprite = new THREE.Sprite(mat)
      sprite.position.set(x, y, z)
      sprite.scale.set(2.7, 0.42, 1)
      sprite.renderOrder = 10
      scene.add(sprite)
    }

    // Pencahayaan
    scene.add(
      new THREE.HemisphereLight("#ffffff", "#b7aa92", 2.3)
    )

    const sunlight = new THREE.DirectionalLight("#fff1d8", 2.5)
    sunlight.position.set(2, 14, 8)
    sunlight.castShadow = true
    sunlight.shadow.mapSize.set(1024, 1024)
    sunlight.shadow.camera.left = -12
    sunlight.shadow.camera.right = 12
    sunlight.shadow.camera.top = 10
    sunlight.shadow.camera.bottom = -10
    sunlight.shadow.normalBias = 0.04
    scene.add(sunlight)

    // Lantai kayu
    box(16, 0.24, 11, 0, -0.15, 0, material("#cabb9e"))

    const floorMaterials = [
      "#e7d7bb",
      "#dfccab",
      "#eadcc2",
      "#e3d2b5",
    ].map((color) => material(color))

    for (let row = 0; row < 11; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        box(
          1.97, 0.035, 0.97,
          -7 + col * 2,
          -0.01,
          -5 + row,
          floorMaterials[(row + col) % 4]
        )
      }
    }

    // Dinding belakang dan kiri
    box(16, 3.5, 0.18, 0, 1.7, -5.5, palette.wall)
    box(0.18, 3.5, 11, -8, 1.7, 0, palette.wall)
    box(16, 0.12, 0.22, 0, 0.08, -5.36, palette.trim)
    box(0.22, 0.12, 11, -7.86, 0.08, 0, palette.trim)

    // Jendela belakang
    for (const x of [-5.8, -1.7, 2.4]) {
      box(2.7, 1.6, 0.12, x, 2.15, -5.34, palette.trim)
      box(2.48, 1.38, 0.14, x, 2.15, -5.25, palette.window)
      box(0.06, 1.4, 0.16, x, 2.15, -5.15, palette.trim)
      box(2.5, 0.06, 0.16, x, 2.15, -5.15, palette.trim)
      box(2.9, 0.1, 0.36, x, 1.3, -5.15, palette.trim)
    }

    // Jendela kiri
    for (const z of [-2.5, 1.2]) {
      box(0.12, 1.6, 2.4, -7.84, 2.15, z, palette.trim)
      box(0.14, 1.38, 2.18, -7.75, 2.15, z, palette.window)
      box(0.16, 0.06, 2.2, -7.65, 2.15, z, palette.trim)
    }

    function plant(x, z, scale = 1) {
      const group = new THREE.Group()
      group.position.set(x, 0, z)
      group.scale.setScalar(scale)
      scene.add(group)

      cylinder(
        0.24, 0.18, 0.48,
        0, 0.24, 0,
        palette.pot, group
      )
      cylinder(
        0.035, 0.035, 0.85,
        0, 0.85, 0,
        palette.wood, group
      )

      for (let i = 0; i < 7; i += 1) {
        const angle = (i / 7) * Math.PI * 2
        const leaf = sphere(
          0.25,
          Math.cos(angle) * 0.23,
          1 + (i % 3) * 0.13,
          Math.sin(angle) * 0.23,
          palette.green,
          group
        )
        leaf.scale.set(0.65, 1.8, 0.6)
        leaf.rotation.z = Math.cos(angle) * 0.5
      }
    }

    plant(-7, -4.6)
    plant(7, 4.6)
    plant(-7, 4.4)
    plant(4.3, -4.7, 0.8)

    function chair(x, z, rotation = 0) {
      const group = new THREE.Group()
      group.position.set(x, 0, z)
      group.rotation.y = rotation
      scene.add(group)

      cylinder(
        0.045, 0.045, 0.55,
        0, 0.34, 0,
        palette.metal, group
      )
      box(
        0.75, 0.13, 0.7,
        0, 0.65, 0,
        palette.chair, group
      )
      box(
        0.75, 0.7, 0.12,
        0, 1.03, 0.32,
        palette.chair, group
      )

      for (const angle of [0, Math.PI / 2]) {
        const leg = box(
          0.85, 0.06, 0.08,
          0, 0.1, 0,
          palette.metal, group
        )
        leg.rotation.y = angle
      }
    }

    // Enam meja dan karakter
    agents.forEach((agent, index) => {
      const { x, z, color } = agent
      const shirt = material(color)

      box(2.1, 0.15, 1.05, x, 1.05, z, palette.darkWood)

      for (const dx of [-0.9, 0.9]) {
        for (const dz of [-0.38, 0.38]) {
          box(
            0.09, 1, 0.09,
            x + dx, 0.5, z + dz,
            palette.metal
          )
        }
      }

      // Monitor, stand, keyboard
      box(0.9, 0.58, 0.08, x, 1.48, z - 0.17, palette.metal)
      box(0.8, 0.46, 0.025, x, 1.48, z - 0.115, palette.screen)
      box(0.08, 0.25, 0.08, x, 1.2, z - 0.17, palette.metal)
      box(0.4, 0.04, 0.23, x, 1.14, z - 0.1, palette.metal)
      box(0.65, 0.035, 0.23, x, 1.15, z + 0.24, palette.trim)

      const screenLines = []

      for (let i = 0; i < 3; i += 1) {
        const line = box(
          0.55 - i * 0.11,
          0.025,
          0.015,
          x - 0.06,
          1.59 - i * 0.1,
          z - 0.095,
          shirt
        )
        screenLines.push(line)
      }

      cylinder(
        0.07, 0.06, 0.15,
        x + 0.78, 1.2, z + 0.2,
        palette.white
      )

      chair(x, z + 0.95)

      // Tubuh
      const body = box(
        0.5, 0.58, 0.32,
        x, 1.05, z + 0.95,
        shirt
      )

      // Kepala dan rambut bergerak sebagai satu grup
      const head = new THREE.Group()
      head.position.set(x, 1.63, z + 0.9)
      scene.add(head)

      sphere(0.25, 0, 0, 0, palette.skin, head)

      const hair = sphere(
        0.26, 0, 0.13, 0.03,
        palette.hair, head
      )
      hair.scale.set(1, 0.65, 1)

      // Mata menghadap monitor
      for (const dx of [-0.085, 0.085]) {
        sphere(
          0.023, dx, 0.015, -0.227,
          palette.metal, head
        )
      }

      // Tangan memakai pivot bahu
      const arms = []

      for (const side of [-1, 1]) {
        const shoulder = new THREE.Group()
        shoulder.position.set(x + side * 0.3, 1.3, z + 0.9)
        shoulder.rotation.x = 0.9
        scene.add(shoulder)

        box(
          0.14, 0.42, 0.14,
          0, -0.18, 0,
          shirt, shoulder
        )
        sphere(
          0.075, 0, -0.4, 0,
          palette.skin, shoulder
        )

        arms.push(shoulder)

        box(
          0.17, 0.38, 0.18,
          x + side * 0.18, 0.52, z + 0.9,
          palette.metal
        )
      }

      animatedAgents.push({
        body,
        head,
        arms,
        screenLines,
        phase: index * 1.4,
      })

      label(agent.name, color, x, 2.3, z + 0.6)
    })

    // Area sofa
    box(
      2.8, 0.08, 2.3,
      -5.4, 0.05, 3.5,
      material("#c7cdbb")
    )
    box(2.2, 0.4, 0.85, -5.6, 0.4, 4.15, palette.sofa)
    box(2.2, 0.65, 0.2, -5.6, 0.82, 4.5, palette.sofa)

    for (const x of [-6.65, -4.55]) {
      box(0.18, 0.5, 0.85, x, 0.68, 4.15, palette.sofa)
    }

    cylinder(
      0.55, 0.55, 0.1,
      -5.5, 0.57, 2.9,
      palette.wood
    )
    cylinder(
      0.08, 0.08, 0.5,
      -5.5, 0.27, 2.9,
      palette.metal
    )

    for (const [x, z, color] of [
      [-3.8, 3.5, "#c4a566"],
      [-3.4, 4.4, "#a1b89a"],
    ]) {
      const seat = sphere(0.4, x, 0.35, z, material(color))
      seat.scale.y = 0.8
    }

    // Ruang meeting
    box(
      4.2, 0.04, 8.7,
      5.5, 0.03, -0.2,
      material("#c5c7bd")
    )

    for (const z of [-4.4, -1.6, 1.2, 4]) {
      box(0.06, 2.9, 0.06, 3.5, 1.45, z, palette.metal)
    }

    box(0.06, 0.06, 8.4, 3.5, 2.9, -0.2, palette.metal)

    for (const z of [-3, -0.2, 2.6]) {
      const glass = box(
        0.025, 2.8, 2.7,
        3.5, 1.45, z,
        palette.glass
      )
      glass.castShadow = false
    }

    box(2, 0.14, 4.7, 5.6, 1.05, 0.1, palette.wood)

    for (const z of [-1.7, 1.9]) {
      box(1.3, 1, 0.14, 5.6, 0.5, z, palette.metal)
    }

    for (const z of [-1.4, 0.1, 1.6]) {
      chair(4.1, z, -Math.PI / 2)
      chair(7.1, z, Math.PI / 2)
    }

    box(2.7, 1.5, 0.12, 5.8, 2, -5.32, palette.metal)
    box(2.5, 1.3, 0.025, 5.8, 2, -5.24, palette.screen)

    label("Ruang Meeting", "#64748b", 5.6, 3.3, 0)
    label("Content Studio", "#475569", -2, 3.65, -5)

    // Resize tanpa merusak proporsi kamera
    function resize() {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return

      const aspect = width / height
      const halfHeight = Math.max(8.5, 12 / aspect)

      camera.left = -halfHeight * aspect
      camera.right = halfHeight * aspect
      camera.top = halfHeight
      camera.bottom = -halfHeight
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()

    // Animasi bekerja terus, sekitar 30 FPS.
    // Browser biasanya menunda requestAnimationFrame pada tab tersembunyi.
    let frameId
    let lastFrame = 0

    function animate(timestamp) {
      frameId = requestAnimationFrame(animate)

      if (timestamp - lastFrame < 1000 / 30) return
      lastFrame = timestamp

      const time = timestamp / 1000

      animatedAgents.forEach((agent) => {
        const { body, head, arms, screenLines, phase } = agent

        body.rotation.x =
          -0.06 + Math.sin(time * 1.8 + phase) * 0.025

        head.rotation.x =
          Math.sin(time * 1.3 + phase) * 0.035

        head.rotation.y =
          Math.sin(time * 0.7 + phase) * 0.06

        arms.forEach((arm, index) => {
          arm.rotation.x =
            0.9 +
            Math.sin(time * 9 + phase + index * Math.PI) * 0.08
        })

        screenLines.forEach((line, index) => {
          line.scale.x =
            0.8 + Math.sin(time * 2 + phase + index) * 0.2
        })
      })

      renderer.render(scene, camera)
    }

    frameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      controls.dispose()
      resetRef.current = null

      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((mat) => mat.dispose())
      textures.forEach((texture) => texture.dispose())
      sunlight.shadow.dispose()

      renderer.dispose()
      canvas.remove()
    }
  }, [])

  return (
    <div
      style={{
        marginTop: 16,
        overflow: "hidden",
        border: "1px solid #e0e7ef",
        borderRadius: 14,
        background: "#f1f5fb",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "10px 12px",
          borderBottom: "1px solid #e3eaf3",
          background: "#ffffffcc",
        }}
      >
        <span style={{ color: "#7a8ba0", fontSize: 11 }}>
          Kantor 3D · Animasi bekerja
        </span>

        <button
          type="button"
          onClick={() => resetRef.current?.()}
          disabled={Boolean(error)}
          style={{
            padding: "6px 10px",
            border: "1px solid #dce5f1",
            borderRadius: 7,
            background: "white",
            color: "#536d8c",
            fontSize: 11,
            cursor: error ? "not-allowed" : "pointer",
          }}
        >
          Reset kamera
        </button>
      </div>

      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(390px, 43vw, 640px)",
        }}
      >
        {error && (
          <p
            role="alert"
            style={{
              padding: 30,
              color: "#a44737",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
      </div>

      <p
        style={{
          margin: 0,
          padding: "10px 12px",
          borderTop: "1px solid #e3eaf3",
          color: "#8b99aa",
          fontSize: 10,
          textAlign: "center",
        }}
      >
        Drag untuk putar · Scroll untuk zoom · Animasi visual,
        belum menunjukkan pekerjaan AI nyata
      </p>
    </div>
  )
}