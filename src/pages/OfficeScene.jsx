import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const cameraPresets = {
  isometric: [12, 13, 21],
  front: [0, 8, 25],
}

export default function OfficeScene({ agents, onSelect, paused, cameraView, resetKey }) {
  const host = useRef(null)
  const callback = useRef(onSelect)
  const pause = useRef(paused)
  const cameraAction = useRef(null)
  const [error, setError] = useState(false)
  useEffect(() => { callback.current = onSelect }, [onSelect])
  useEffect(() => { pause.current = paused }, [paused])
  useEffect(() => {
    const element = host.current
    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) }
    catch { setError(true); return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    element.appendChild(renderer.domElement)
    renderer.domElement.setAttribute('aria-label', 'Kantor 3D. Pilih anggota lewat tombol agent di bawah.')
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100)
    camera.position.set(15, 14, 19)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 0)
    controls.enableDamping = true
    controls.minDistance = 12
    controls.maxDistance = 64
    controls.maxPolarAngle = Math.PI / 2.15
    controls.minPolarAngle = .3
    controls.enablePan = false
    scene.add(new THREE.HemisphereLight(0xffffff, 0x777c91, 2.5))
    const sun = new THREE.DirectionalLight(0xffefda, 3.1)
    sun.position.set(-5, 14, 9); sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 })
    sun.shadow.normalBias = .04
    scene.add(sun)
    const items = [], animated = []
    function positionCamera(view) {
      const direction = new THREE.Vector3(...cameraPresets[view])
      direction.multiplyScalar(Math.max(1, 1.25 / camera.aspect))
      controls.target.set(0, 1, 0)
      camera.position.copy(controls.target).add(direction)
      controls.update()
    }
    cameraAction.current = { view: 'isometric', positionCamera }
    function box(parent, x, y, z, w, h, d, color, sphere = false) {
      const geometry = sphere ? new THREE.SphereGeometry(w, 18, 12) : new THREE.BoxGeometry(w, h, d)
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: .65 }))
      mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true
      parent.add(mesh); return mesh
    }
    function label(text, x, y, z, color = '#253047', width = 2.4) {
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(0, 0, 512, 96, 32); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.font = '600 29px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(text, 256, 48)
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }))
      sprite.position.set(x, y, z); sprite.scale.set(width, width * 96 / 512, 1); scene.add(sprite)
      return sprite
    }
    function plant(x, z) {
      const group = new THREE.Group(); group.position.set(x, 0, z); scene.add(group)
      box(group, 0, .3, 0, .5, .6, .5, '#dad4c7')
      box(group, 0, .95, 0, .07, 1.2, .07, '#77765a')
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3
        const leaf = box(group, Math.cos(a) * .22, 1.15 + i % 2 * .22, Math.sin(a) * .22, .23, 0, 0, '#6d9970', true)
        leaf.scale.set(.7, 2.3, .8); leaf.rotation.z = Math.cos(a) * .5
      }
    }
    box(scene, 0, -.2, 0, 16, .4, 11, '#b8a48b')
    for (let x = -7.5; x < 8; x += 1) for (let z = -5; z < 5.5; z += 1) {
      let color = '#d9c8af'
      if (Math.round(x + z + .5) % 3 === 0) color = '#e6d5bb'
      box(scene, x, .015, z, .985, .03, .985, color)
    }
    box(scene, 0, 2, -5.5, 16, 4, .16, '#e0ded8')
    box(scene, -8, 2, 0, .16, 4, 11, '#d4d3cc')
    for (const x of [-5.5, -.8, 4]) {
      box(scene, x, 2.55, -5.37, 3.7, 2.05, .08, '#91afc0')
      for (const dx of [-1.85, 0, 1.85]) box(scene, x + dx, 2.55, -5.27, .07, 2.15, .1, '#f6f4ec')
      box(scene, x, 2.55, -5.26, 3.8, .07, .1, '#f6f4ec')
      box(scene, x, 1.5, -5.15, 4, .1, .35, '#f6f4ec')
    }
    box(scene, 0, -.34, 0, 16.2, .16, 11.2, '#817767')
    box(scene, -.5, .05, 4.12, 5.9, .045, 2.32, '#c8bbd4')
    for (const x of [-3.2, 2.1]) {
      box(scene, x, 4, -2.7, .035, .6, .035, '#594d60')
      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(.38, .3, 20),
        new THREE.MeshStandardMaterial({ color: '#dabd83', emissive: '#8f613c', emissiveIntensity: .14 })
      )
      shade.position.set(x, 3.56, -2.7)
      shade.castShadow = true
      scene.add(shade)
    }
    // Low cabinet, pinboard, and shared lounge.
    box(scene, -7.55, .65, -3.1, .74, 1.3, 2.55, '#b0a18f')
    for (const z of [-3.9, -3.1, -2.3]) {
      box(scene, -7.15, .7, z, .08, 1.03, .68, '#d3c4af')
      box(scene, -7.09, .9, z, .055, .055, .26, '#615a57')
    }
    box(scene, -7.88, 2.65, .5, .09, 1.25, 2.5, '#b39d87')
    for (const [i, color] of ['#e6c49b', '#d6bcd5', '#aec9bd'].entries()) {
      box(scene, -7.82, 2.65 + (i % 2) * .16, -.2 + i * .62, .018, .38, .43, color)
    }
    const colors = ['#7399b9', '#9a8cc0', '#72a28a']
    for (let div = 0; div < 3; div++) {
      const x = -5.3 + div * 5.2
      box(scene, x, .05, -.5, 4.5, .035, 6.5, ['#b9c7cc', '#c7bdd1', '#bed0c3'][div])
      label(['CONTENT STUDIO', 'TRADING RESEARCH', 'DIGITAL PRODUCTS'][div], x, 3.7, -3, ['#446780', '#70608b', '#496f5d'][div], 3)
      for (let row = 0; row < 2; row++) {
        const z = -2.2 + row * 3.1
        const agent = agents[div * 2 + row]
        box(scene, x, 1.05, z, 3.2, .14, 1.35, '#ebdfcc')
        for (const dx of [-1.35, 1.35]) box(scene, x + dx, .5, z, .12, 1, 1.1, '#64717a')
        box(scene, x, 1.62, z - .24, 1.1, .72, .08, '#293840')
        box(scene, x, 1.63, z - .19, .94, .54, .015, '#82a9b7')
        for (let line = 0; line < 3; line++) box(scene, x - .12, 1.78 - line * .13, z - .175, .5 - line * .09, .025, .01, '#dbf4e8')
        box(scene, x, 1.25, z - .24, .08, .4, .08, '#394851')
        box(scene, x, 1.14, z + .23, .85, .035, .28, '#9da9aa')
        box(scene, x + 1.1, 1.24, z, .17, .26, .17, '#fffaf3')
        box(scene, x - 1.04, 1.14, z + .34, .42, .055, .36, colors[div])
        box(scene, x - .93, 1.18, z + .34, .04, .025, .28, '#4b4950')
        box(scene, x, .62, z + 1, .8, .15, .8, colors[div])
        box(scene, x, 1.05, z + 1.35, .85, .9, .12, colors[div])
        box(scene, x, .3, z + 1, .12, .6, .12, '#45505b')
        box(scene, x, .12, z + 1, 1, .08, .1, '#45505b')
        const person = new THREE.Group(); person.position.set(x, .7, z + .8); scene.add(person)
        box(person, 0, .43, 0, .55, .7, .4, colors[div])
        box(person, 0, 1.04, 0, .29, 0, 0, '#cba588', true)
        const hair = box(person, 0, 1.18, .02, .30, 0, 0, '#343039', true); hair.scale.y = .65
        for (const dx of [-.35, .35]) {
          const arm = box(person, dx, .45, -.24, .16, .18, .65, colors[div]); animated.push(arm)
          box(person, dx, .43, -.55, .16, .12, .18, '#cba588')
        }
        person.traverse(obj => { if (obj.isMesh) { obj.userData.agent = agent; items.push(obj) } })
        const name = label(agent.name, x, 2.65, z + .65, '#303746', 2.2)
        name.userData.agent = agent; items.push(name)
      }
    }
    box(scene, -4.7, .4, 4.3, 3.2, .7, 1, '#b0b9a7')
    box(scene, -4.7, .95, 4.7, 3.2, .7, .22, '#a2ad98')
    for (const x of [-5.65, -4.7, -3.75]) {
      box(scene, x, .75, 4.24, .88, .17, .76, '#c7d1c0')
    }
    box(scene, -6.33, .73, 4.38, .25, .52, .94, '#a2ad98')
    box(scene, -3.07, .73, 4.38, .25, .52, .94, '#a2ad98')
    box(scene, -.5, .55, 4.1, 1.8, .12, 1, '#e9dfcd')
    box(scene, -.85, .63, 4.2, .4, .05, .34, '#a9a0be')
    box(scene, -.02, .73, 4.06, .18, .24, .18, '#f5efe5')
    box(scene, -.5, .25, 4.1, .65, .5, .6, '#697179')
    for (const [x, z] of [[-7, -4.5], [7, -4.5], [7, 4.5], [-7, 3.2], [2, 4.3]]) plant(x, z)
    const ray = new THREE.Raycaster(), pointer = new THREE.Vector2()
    let down = null
    function pointerDown(e) { down = [e.clientX, e.clientY] }
    function choose(e) {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1)
      ray.setFromCamera(pointer, camera)
      const hit = ray.intersectObjects(items)[0]
      if (hit) callback.current(hit.object.userData.agent)
    }
    renderer.domElement.addEventListener('pointerdown', pointerDown)
    renderer.domElement.addEventListener('pointerup', choose)
    const resize = new ResizeObserver(() => {
      const { width, height } = element.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      positionCamera(cameraAction.current.view)
    }); resize.observe(element)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame, time = 0, previous = performance.now()
    function animate(now) {
      frame = requestAnimationFrame(animate)
      if (!pause.current && !reduced.matches) time += Math.min((now - previous) / 1000, .05)
      previous = now
      animated.forEach((arm, i) => { arm.rotation.x = Math.sin(time * 5 + i * 1.3) * .06 })
      controls.update(); renderer.render(scene, camera)
    }
    frame = requestAnimationFrame(animate)
    return () => {
      cameraAction.current = null
      cancelAnimationFrame(frame); resize.disconnect(); controls.dispose()
      renderer.domElement.removeEventListener('pointerdown', pointerDown)
      renderer.domElement.removeEventListener('pointerup', choose)
      scene.traverse(obj => {
        obj.geometry?.dispose()
        if (obj.material) { obj.material.map?.dispose(); obj.material.dispose() }
      })
      renderer.dispose(); renderer.domElement.remove()
    }
  }, [agents])
  useEffect(() => {
    const action = cameraAction.current
    if (!action) return
    action.view = cameraView
    action.positionCamera(cameraView)
  }, [cameraView, resetKey])
  return <div className="fh-scene" ref={host}>{error && <>
      <svg viewBox="0 0 1000 620" className="fh-fallback" role="img" aria-label="Denah kantor isometrik, mode kompatibilitas tanpa WebGL">
        <defs><linearGradient id="fh-fallback-floor-fill" x2="100%" y2="100%"><stop stopColor="#eddfc9"/><stop offset="1" stopColor="#c8b99e"/></linearGradient></defs>
        <ellipse cx="505" cy="460" rx="390" ry="100" fill="#374151" opacity=".15"/>
        <path d="M100 310 500 120 900 310 500 540Z" fill="url(#fh-fallback-floor-fill)" stroke="#b9ac95" strokeWidth="8"/>
        <path d="M100 310V150L500 40V120Z" fill="#d8d8d2"/>
        <path d="M500 40 900 150V310L500 120Z" fill="#eeece5"/>
        {[0,1,2].map(i=><g key={i}>
          <path d={['M150 163 235 140V240L150 275Z','M280 126 365 103V187L280 225Z','M590 95 700 125V225L590 185Z'][i]} fill="#9dbbc6" stroke="#f4f2e9" strokeWidth="8"/>
        </g>)}
        {agents.map((agent,i)=>{
          const x=250+(i%3)*205+(i>2?30:0), y=265+Math.floor(i/3)*120
          return <g key={agent.name} transform={'translate('+x+' '+y+')'}>
            <path d="M-65 10 0-22 90 16 25 52Z" fill="#f5e8d0" stroke="#b7a993"/>
            <path d="M-60 13V65M80 21V75M25 50V93" stroke="#68717a" strokeWidth="7"/>
            <path d="M-20-30 30-10V23L-20 3Z" fill="#324553" stroke="#809aa5" strokeWidth="3"/>
            <path d="M-13-20 22-6M-13-11 10-2" stroke="#b0d3d6" strokeWidth="3"/>
            <ellipse cx="32" cy="90" rx="22" ry="9" fill="#77818d"/>
            <path d="M32 65V88" stroke="#47515b" strokeWidth="5"/>
            <rect x="13" y="30" width="38" height="40" rx="10" fill={['#779ab5','#9d8cbd','#85a58a'][i%3]}/>
            <circle cx="32" cy="20" r="16" fill="#c8a78c"/>
            <path d="M16 18Q10-5 33 1Q54 0 48 22L40 12Z" fill="#393438"/>
            <rect x="-45" y="-65" width="145" height="22" rx="11" fill="#293544"/>
            <text x="27" y="-50" fill="white" textAnchor="middle" fontSize="10" fontFamily="sans-serif">{agent.name}</text>
          </g>
        })}
        <text x="500" y="585" textAnchor="middle" fill="#263343" fontSize="12">Mode kompatibilitas · Aktifkan WebGL untuk rotasi 3D</text>
      </svg>
    </>}</div>
}
