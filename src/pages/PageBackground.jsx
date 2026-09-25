import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Site-wide animated background: shifting cream/blush gradient,
 * wireframe rings, floating 3D books + graduation caps,
 * soft dust particles and glow orbs.
 * Render it ONCE in your layout (not inside individual pages).
 */
export default function PageBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const motionScale = reduceMotion ? 0.25 : 1

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 32

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Track everything we create so cleanup is simple
    const disposables = []
    const track = (obj) => {
      disposables.push(obj)
      return obj
    }

    // ---------- Lights ----------
    scene.add(new THREE.AmbientLight(0xffffff, 1.4))

    const sun = new THREE.DirectionalLight(0xffffff, 1.2)
    sun.position.set(10, 20, 25)
    scene.add(sun)

    const pointLight = new THREE.PointLight(0xd97706, 2.4, 65)
    pointLight.position.set(18, 22, 22)
    scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(0x818cf8, 2.4, 65)
    pointLight2.position.set(-18, -22, 22)
    scene.add(pointLight2)

    // ---------- Wireframe rings (icosahedrons) ----------
    const icoGeometry1 = track(new THREE.IcosahedronGeometry(13, 1))
    const icoMaterial1 = track(
      new THREE.MeshStandardMaterial({
        color: 0xd97706,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      })
    )
    const icosahedron1 = new THREE.Mesh(icoGeometry1, icoMaterial1)
    scene.add(icosahedron1)

    const icoGeometry2 = track(new THREE.IcosahedronGeometry(8, 1))
    const icoMaterial2 = track(
      new THREE.MeshStandardMaterial({
        color: 0x818cf8,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      })
    )
    const icosahedron2 = new THREE.Mesh(icoGeometry2, icoMaterial2)
    icosahedron2.position.set(-20, 10, -10)
    scene.add(icosahedron2)

    // ---------- Soft dust particles ----------
    const particleCount = 500
    const pGeometry = track(new THREE.BufferGeometry())
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const dustColors = [new THREE.Color(0xd97706), new THREE.Color(0xf472b6), new THREE.Color(0x818cf8)]

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 85
      positions[i + 1] = (Math.random() - 0.5) * 85
      positions[i + 2] = (Math.random() - 0.5) * 50
      const c = dustColors[Math.floor(Math.random() * 3)]
      colors[i] = c.r
      colors[i + 1] = c.g
      colors[i + 2] = c.b
    }
    pGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    pGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const pMaterial = track(
      new THREE.PointsMaterial({
        size: 0.35,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
      })
    )
    const particles = new THREE.Points(pGeometry, pMaterial)
    scene.add(particles)

    // ---------- Shared materials ----------
    const mat = (color, roughness = 0.6) =>
      track(new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05 }))

    const bookCoverMats = [
      mat(0x3730a3), // indigo
      mat(0xb45309), // amber-brown
      mat(0xbe185d), // rose
      mat(0x0f766e), // teal
      mat(0x7f1d1d), // burgundy
      mat(0x1e3a8a), // navy
    ]
    const pagesMat = mat(0xfff7e6, 0.9)
    const goldMat = mat(0xf59e0b, 0.35)
    const capMat = mat(0x1f2937, 0.7)
    const tasselMat = mat(0xf59e0b, 0.5)

    // ---------- Shared geometries ----------
    const coverGeo = track(new THREE.BoxGeometry(2.2, 3, 0.08))
    const spineGeo = track(new THREE.BoxGeometry(0.12, 3, 0.5))
    const pagesGeo = track(new THREE.BoxGeometry(2.0, 2.85, 0.34))
    const labelGeo = track(new THREE.BoxGeometry(1.1, 0.45, 0.02))

    const boardGeo = track(new THREE.BoxGeometry(3.2, 0.12, 3.2))
    const skullGeo = track(new THREE.CylinderGeometry(1.1, 1.3, 0.9, 24))
    const buttonGeo = track(new THREE.SphereGeometry(0.13, 12, 12))
    const cordGeo = track(new THREE.CylinderGeometry(0.03, 0.03, 2.26, 6))
    const stringGeo = track(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6))
    const tasselGeo = track(new THREE.CylinderGeometry(0.1, 0.17, 0.45, 8))

    // ---------- Builders ----------
    const createBook = (coverMat) => {
      const g = new THREE.Group()

      const front = new THREE.Mesh(coverGeo, coverMat)
      front.position.z = 0.21
      const back = new THREE.Mesh(coverGeo, coverMat)
      back.position.z = -0.21
      const spine = new THREE.Mesh(spineGeo, coverMat)
      spine.position.x = -1.04
      const pages = new THREE.Mesh(pagesGeo, pagesMat)
      pages.position.x = 0.05
      const label = new THREE.Mesh(labelGeo, goldMat)
      label.position.set(0.05, 0.6, 0.26)

      g.add(front, back, spine, pages, label)
      return g
    }

    const createCap = () => {
      const g = new THREE.Group()

      const board = new THREE.Mesh(boardGeo, capMat)
      const skull = new THREE.Mesh(skullGeo, capMat)
      skull.position.y = -0.51
      const button = new THREE.Mesh(buttonGeo, tasselMat)
      button.position.y = 0.1

      // Cord from the button to the corner
      const cordWrap = new THREE.Group()
      cordWrap.position.y = 0.08
      cordWrap.rotation.y = -Math.PI / 4
      const cord = new THREE.Mesh(cordGeo, tasselMat)
      cord.rotation.z = Math.PI / 2
      cord.position.x = 1.13
      cordWrap.add(cord)

      // Hanging tassel at the corner
      const string = new THREE.Mesh(stringGeo, tasselMat)
      string.position.set(1.6, -0.4, 1.6)
      const tassel = new THREE.Mesh(tasselGeo, tasselMat)
      tassel.position.set(1.6, -1.05, 1.6)

      g.add(board, skull, button, cordWrap, string, tassel)
      return g
    }

    // ---------- Floating items ----------
    const floaters = new THREE.Group()
    scene.add(floaters)

    const getBounds = () => {
      const halfH = Math.tan(THREE.MathUtils.degToRad(30)) * camera.position.z + 6
      return { halfH, halfW: halfH * camera.aspect }
    }

    const rand = (min, max) => min + Math.random() * (max - min)

    const respawn = (item, initial = false) => {
      const { halfH, halfW } = getBounds()
      const d = item.userData
      d.baseX = rand(-halfW, halfW)
      item.position.y = initial ? rand(-halfH, halfH) : -halfH
      item.position.z = rand(-15, 8)
      d.baseZ = item.position.z
    }

    const itemCount = window.innerWidth < 768 ? 18 : 34
    const items = []

    for (let i = 0; i < itemCount; i++) {
      const isBook = i % 2 === 0
      const item = isBook
        ? createBook(bookCoverMats[i % bookCoverMats.length])
        : createCap()

      const s = rand(0.3, 0.6)
      item.scale.setScalar(s)
      item.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI))

      item.userData = {
        baseX: 0,
        baseZ: 0,
        speed: rand(0.6, 1.6),         // upward drift (units/sec)
        swayAmp: rand(0.5, 1.8),
        swayFreq: rand(0.2, 0.5),
        phase: rand(0, Math.PI * 2),
        spin: new THREE.Vector3(rand(-0.3, 0.3), rand(-0.4, 0.4), rand(-0.2, 0.2)),
      }

      respawn(item, true)
      item.position.x = item.userData.baseX
      floaters.add(item)
      items.push(item)
    }

    // ---------- Interaction ----------
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove)

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // ---------- Animation ----------
    let animationFrameId
    const clock = new THREE.Clock()

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05) // clamp after tab switches
      const t = clock.elapsedTime

      targetX += (mouseX - targetX) * 0.05
      targetY += (mouseY - targetY) * 0.05

      // Camera parallax (depth-based, so near items move more than far ones)
      camera.position.x = targetX * 4
      camera.position.y = -targetY * 3
      camera.lookAt(0, 0, 0)

      // Wireframe rings
      icosahedron1.rotation.x = t * 0.05 * motionScale
      icosahedron1.rotation.y = t * 0.07 * motionScale
      icosahedron2.rotation.x = -t * 0.04 * motionScale
      icosahedron2.rotation.y = -t * 0.06 * motionScale

      const { halfH } = getBounds()

      for (const item of items) {
        const d = item.userData

        item.position.y += d.speed * dt * motionScale
        item.position.x = d.baseX + Math.sin(t * d.swayFreq + d.phase) * d.swayAmp

        item.rotation.x += d.spin.x * dt * motionScale
        item.rotation.y += d.spin.y * dt * motionScale
        item.rotation.z += d.spin.z * dt * motionScale

        if (item.position.y > halfH) respawn(item)
      }

      particles.rotation.y = t * 0.02
      particles.rotation.x = t * 0.01

      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
    }
  }, []) 
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .site-animated-bg {
          background: linear-gradient(120deg, #FFF3DC 0%, #FDE6C8 22%, #FBD9C4 40%, #F3D9F0 60%, #E4E3FB 78%, #FFF3DC 100%);
          background-size: 320% 320%;
          animation: gradientShift 16s ease infinite;
        }
      `}</style>

      {/* Animated gradient */}
      <div className="absolute inset-0 site-animated-bg" />

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-[650px] h-[650px] bg-gradient-to-tr from-amber-200/40 via-rose-100/50 to-orange-100/30 rounded-full blur-[130px]" />
      <div className="absolute top-1/3 right-10 w-[750px] h-[750px] bg-gradient-to-br from-indigo-100/40 via-rose-200/30 to-amber-100/40 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 left-10 w-[600px] h-[600px] bg-gradient-to-r from-amber-100/40 to-rose-100/40 rounded-full blur-[140px]" />

      {/* 3D scene */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />
    </div>
  )
}

