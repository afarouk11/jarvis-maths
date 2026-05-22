'use client'

import { useRef, useMemo, useState, useCallback, useEffect, Component, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'
import { motion } from 'framer-motion'
import { TOPIC_EDGES } from '@/lib/curriculum/topic-graph'
import { masteryLabel } from '@/lib/bkt/bayesian-knowledge-tracing'
import type { Topic } from '@/types'

// Red (0%) → blue (50%) → green (100%)
function progressColor(pKnown: number): string {
  if (pKnown <= 0.5) {
    const t = pKnown / 0.5
    return `rgb(${Math.round(239 + (59 - 239) * t)},${Math.round(68 + (130 - 68) * t)},${Math.round(68 + (246 - 68) * t)})`
  }
  const t = (pKnown - 0.5) / 0.5
  return `rgb(${Math.round(59 + (34 - 59) * t)},${Math.round(130 + (197 - 130) * t)},${Math.round(246 + (94 - 246) * t)})`
}

function progressHex(pKnown: number): string {
  const c = progressColor(pKnown)
  const [r, g, b] = c.replace('rgb(', '').replace(')', '').split(',').map(Number)
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}
import type { StudentProgress } from '@/types'

class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { crashed: boolean; key: number }
> {
  constructor(props: any) {
    super(props)
    this.state = { crashed: false, key: 0 }
  }
  static getDerivedStateFromError() { return { crashed: true } }
  componentDidCatch() {
    setTimeout(() => this.setState(s => ({ crashed: false, key: s.key + 1 })), 1500)
  }
  render() {
    if (this.state.crashed) return this.props.fallback
    return <div key={this.state.key}>{this.props.children}</div>
  }
}

const noise3D = createNoise3D()

// ── Brain mesh ────────────────────────────────────────────────────────────────
function BrainMesh() {
  const groupRef = useRef<THREE.Group>(null)

  const makeHemisphere = useMemo(() => (side: -1 | 1) => {
    const geo = new THREE.SphereGeometry(1, 56, 56)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)

      // Base proportions: wider laterally, elongated front-to-back, slightly flat top/bottom
      x *= 1.12
      y *= 0.92
      z *= 1.38

      // Frontal lobe: forward and upward bulge at front
      const frontT = Math.max(0, z) / 1.38
      y += frontT * frontT * 0.10

      // Occipital lobe: pointed protrusion at back
      const backT = Math.max(0, -z) / 1.38
      z -= backT * backT * 0.14
      y -= backT * 0.04

      // Parietal bulge: high on the top-middle
      const parietalT = Math.max(0, y) * Math.max(0, 1 - Math.abs(z) * 0.7)
      y += parietalT * 0.09

      // Temporal lobe: pronounced lower-lateral protrusion
      const latAmt = Math.max(0, Math.abs(x) - 0.22)
      if (y < 0.12) {
        const tDepth = Math.max(0, 0.12 - y)
        y -= latAmt * tDepth * 0.58
        x += Math.sign(x) * latAmt * 0.13
      }

      // Flatten the base (where brain sits on skull)
      if (y < -0.56) y = -0.56 + (y + 0.56) * 0.32

      const len = Math.sqrt(x * x + y * y + z * z)
      const nx = x / len, ny = y / len, nz = z / len

      // Sylvian (lateral) fissure — deep horizontal groove on each side face
      const lat = Math.max(0, (Math.abs(nx) - 0.16) / 0.56)
      const sylvian = lat * Math.exp(-((ny - 0.06) * (ny - 0.06)) * 11) * 0.62

      // Longitudinal fissure — deep midline groove separating hemispheres
      // Only in upper brain, fades toward base
      const medial = Math.abs(nx)
      const longFissure = medial < 0.22
        ? -0.68 * (1 - medial / 0.22) * Math.max(0, (ny + 0.15) / 1.15)
        : 0

      // Central sulcus — vertical groove separating frontal from parietal
      const centralSulcus = Math.exp(-((nz - 0.05) * (nz - 0.05)) * 18)
        * Math.max(0, ny)
        * (1 - Math.abs(nx) * 1.4)
        * -0.18

      // Gyri — ridged noise creates sharp sulci between broad folds.
      // Large primary folds (low freq)
      const n1 = noise3D(nx * 2.2 + side * 3.3, ny * 2.2, nz * 2.2)
      // Secondary folds — ridged: peaks are broad, valleys are sharp
      const n2 = noise3D(nx * 5.2 + side * 6.4, ny * 5.2, nz * 5.2)
      const ridged2 = (1 - Math.abs(n2)) - 0.5   // range ~[-0.5, 0.5], sharp troughs
      // Fine sulci
      const n3 = noise3D(nx * 11 + side * 13, ny * 11, nz * 11)
      const ridged3 = (1 - Math.abs(n3)) - 0.5
      // Surface micro-texture
      const n4 = noise3D(nx * 24 + side * 27, ny * 24, nz * 24)

      const gyri =
        n1      * 0.34 +
        ridged2 * 0.22 +
        ridged3 * 0.09 +
        n4      * 0.022

      const r = len + gyri + longFissure + centralSulcus - sylvian
      pos.setXYZ(i, nx * r * 0.97 + side * 0.14, ny * r, nz * r)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  const leftGeo  = useMemo(() => makeHemisphere(-1), [makeHemisphere])
  const rightGeo = useMemo(() => makeHemisphere(1),  [makeHemisphere])

  // Cerebellum — flattened oval with tight horizontal folia (real cerebellum looks layered)
  const cerebellumGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 40, 40)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
      // Squash into a wide, flat disc shape
      x *= 1.35
      y *= 0.58
      z *= 1.05
      const len = Math.sqrt(x * x + y * y + z * z)
      const nx = x / len, ny = y / len, nz = z / len
      // Horizontal folia — noise periodic strongly in y (vertical) to create layered look
      const folia =
        noise3D(nx * 5, y * 22, nz * 5) * 0.10 +
        noise3D(nx * 3, y * 14, nz * 3) * 0.07 +
        noise3D(nx * 8, y * 30, nz * 8) * 0.04
      const r = len + folia
      pos.setXYZ(i, nx * r, ny * r, nz * r)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  // Brainstem — tapered cylinder connecting brain to spine
  const brainstemGeo = useMemo(() =>
    new THREE.CylinderGeometry(0.14, 0.20, 0.75, 20, 4), [])

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.12
  })

  const solidMat = (
    <meshPhongMaterial
      color="#0a1a2e"
      emissive="#c47a20"
      emissiveIntensity={0.7}
      specular="#aaddff"
      shininess={90}
      transparent opacity={0.09}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  )
  const wireMat = (
    <meshBasicMaterial color="#c47a20" wireframe transparent opacity={0.04} />
  )
  const cerebellumSolidMat = (
    <meshPhongMaterial
      color="#0a1a2e"
      emissive="#b86e18"
      emissiveIntensity={0.65}
      specular="#aaddff"
      shininess={70}
      transparent opacity={0.08}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  )

  return (
    <group ref={groupRef} scale={1.3}>
      {/* Left hemisphere */}
      <mesh geometry={leftGeo}>{solidMat}</mesh>
      <mesh geometry={leftGeo}>{wireMat}</mesh>

      {/* Right hemisphere */}
      <mesh geometry={rightGeo}>{solidMat}</mesh>
      <mesh geometry={rightGeo}>{wireMat}</mesh>

      {/* Cerebellum — sits at the back-bottom */}
      <mesh geometry={cerebellumGeo} position={[0, -0.90, -0.72]} scale={[0.50, 0.50, 0.50]}>
        {cerebellumSolidMat}
      </mesh>
      <mesh geometry={cerebellumGeo} position={[0, -0.90, -0.72]} scale={[0.50, 0.50, 0.50]}>
        <meshBasicMaterial color="#fbbf24" wireframe transparent opacity={0.13} />
      </mesh>

      {/* Brainstem */}
      <mesh geometry={brainstemGeo} position={[0, -1.32, -0.18]}
        rotation={[0.18, 0, 0]}>
        <meshPhongMaterial color="#0a1a2e" emissive="#b86e18" emissiveIntensity={0.65}
          transparent opacity={0.10} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ── Synapse pulse travelling along a line ─────────────────────────────────────
function InstancedPulses({ arcs, colors }: { arcs: THREE.Vector3[][]; colors: string[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const progresses = useRef(arcs.map(() => Math.random()))
  const speeds = useRef(arcs.map(() => 0.3 + Math.random() * 0.4))
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (!meshRef.current) return
    colors.forEach((c, i) => meshRef.current!.setColorAt(i, new THREE.Color(c)))
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [colors])

  useFrame((_, dt) => {
    if (!meshRef.current) return
    for (let i = 0; i < arcs.length; i++) {
      progresses.current[i] = (progresses.current[i] + dt * speeds.current[i]) % 1
      const arc = arcs[i]
      const t = progresses.current[i] * (arc.length - 1)
      const idx = Math.floor(t)
      const f = t - idx
      dummy.position.lerpVectors(arc[idx], arc[Math.min(idx + 1, arc.length - 1)], f)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, arcs.length]}>
      <sphereGeometry args={[0.013, 6, 6]} />
      <meshStandardMaterial emissiveIntensity={0.4} transparent opacity={0.6} vertexColors />
    </instancedMesh>
  )
}

// ── Neuron node ───────────────────────────────────────────────────────────────
function Neuron({
  position, color, name, slug, pKnown, active, onHover, onClick,
}: {
  position: THREE.Vector3
  color: string
  name: string
  slug: string
  pKnown: number
  active: boolean
  onHover: (info: { name: string; slug: string; pKnown: number } | null) => void
  onClick: (slug: string) => void
}) {
  const ref = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const r = 0.055 + pKnown * 0.055

  useFrame(({ clock }) => {
    if (!ref.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 2 + position.x * 5) * 0.15
    ref.current.scale.setScalar(hovered ? 2.2 : pulse)
  })

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerEnter={e => { e.stopPropagation(); setHovered(true); onHover({ name, slug, pKnown }) }}
      onPointerLeave={() => { setHovered(false); onHover(null) }}
      onClick={e => { e.stopPropagation(); onClick(slug) }}>
      <sphereGeometry args={[r, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={!active ? 0.5 : hovered ? 10 : 5}
        transparent opacity={active ? 1 : 0.12}
      />
    </mesh>
  )
}

// ── Holographic rings ─────────────────────────────────────────────────────────
function HoloRings() {
  const g1 = useRef<THREE.Group>(null)
  const g2 = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (g1.current) g1.current.rotation.z += dt * 0.4
    if (g2.current) g2.current.rotation.x += dt * 0.25
  })
  return (
    <>
      <group ref={g1}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.0, 0.006, 8, 120]} />
          <meshBasicMaterial color="#d97706" transparent opacity={0.35} />
        </mesh>
      </group>
      <group ref={g2}>
        <mesh rotation={[0.4, 0, 0]}>
          <torusGeometry args={[3.4, 0.004, 8, 120]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.18} />
        </mesh>
      </group>
    </>
  )
}

function arcPoints(a: THREE.Vector3, b: THREE.Vector3, segments = 12): THREE.Vector3[] {
  const ra = a.length()
  const rb = b.length()
  const na = a.clone().normalize()
  const nb = b.clone().normalize()
  return Array.from({ length: segments + 1 }, (_, i) => {
    const t = i / segments
    const r = (ra + (rb - ra) * t) * 1.0
    return na.clone().lerp(nb, t).normalize().multiplyScalar(r)
  })
}

// ── Scene: neurons + synapses ─────────────────────────────────────────────────
function NeuralScene({
  progress,
  onHover,
  onClick,
  sectionFilter,
  topics,
  topicCategories,
}: {
  progress: StudentProgress[]
  onHover: (info: { name: string; slug: string; pKnown: number } | null) => void
  onClick: (slug: string) => void
  sectionFilter: string | null
  topics: Omit<Topic, 'id' | 'parent_id'>[]
  topicCategories: Record<string, string[]>
}) {
  const slugMap = useMemo(() => new Map(progress.map(p => [p.topic_id, p.p_known])), [progress])

  const filteredSlugs = useMemo(() => {
    if (sectionFilter === null) return null
    const slugs = topicCategories[sectionFilter] ?? []
    return new Set(slugs)
  }, [sectionFilter, topicCategories])

  const nodePositions = useMemo(() => {
    const map = new Map<string, THREE.Vector3>()
    const R = 1.3

    // For A-level: cluster neurons into 3 spatial zones on the sphere surface.
    // Pure → front/upper, Stats → left, Mechanics → right.
    const A_LEVEL_ZONES: Record<string, { cx: number; cy: number; cz: number; halfAngle: number }> = {
      'Pure Mathematics': { cx: 0,    cy: 0.5,   cz: 1,     halfAngle: 1.0 },
      'Statistics':       { cx: -1,   cy: 0.1,   cz: -0.55, halfAngle: 0.85 },
      'Mechanics':        { cx: 1,    cy: -0.15, cz: -0.55, halfAngle: 0.80 },
    }

    function placeInCap(slugs: string[], cx: number, cy: number, cz: number, halfAngle: number) {
      const center = new THREE.Vector3(cx, cy, cz).normalize()
      const ref = Math.abs(center.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
      const u = new THREE.Vector3().crossVectors(ref, center).normalize()
      const v = new THREE.Vector3().crossVectors(center, u).normalize()
      const cosMax = Math.cos(halfAngle)
      const phi = Math.PI * (3 - Math.sqrt(5))
      slugs.forEach((slug, i) => {
        const cosT = 1 - ((i + 0.5) / slugs.length) * (1 - cosMax)
        const sinT = Math.sqrt(Math.max(0, 1 - cosT * cosT))
        const angle = phi * i
        const pos = u.clone().multiplyScalar(sinT * Math.cos(angle))
          .add(v.clone().multiplyScalar(sinT * Math.sin(angle)))
          .add(center.clone().multiplyScalar(cosT))
          .multiplyScalar(R)
        map.set(slug, pos)
      })
    }

    const handled = new Set<string>()
    for (const [sec, zone] of Object.entries(A_LEVEL_ZONES)) {
      const slugsInSec = (topicCategories[sec] ?? []).filter(s => topics.some(t => t.slug === s))
      if (slugsInSec.length === 0) continue
      placeInCap(slugsInSec, zone.cx, zone.cy, zone.cz, zone.halfAngle)
      slugsInSec.forEach(s => handled.add(s))
    }

    // GCSE or uncategorised: uniform Fibonacci spiral
    const remaining = topics.filter(t => !handled.has(t.slug))
    if (remaining.length > 0) {
      const phi = Math.PI * (3 - Math.sqrt(5))
      remaining.forEach((t, i) => {
        const y = 1 - (i / Math.max(1, remaining.length - 1)) * 2
        const r = Math.sqrt(Math.max(0, 1 - y * y))
        const theta = phi * i
        map.set(t.slug, new THREE.Vector3(Math.cos(theta) * r * R, y * R, Math.sin(theta) * r * R))
      })
    }

    return map
  }, [topics, topicCategories])

  const edgeData = useMemo(() => (
    TOPIC_EDGES
      .filter(([s, t]) => nodePositions.has(s) && nodePositions.has(t))
      .map(([s, t]) => {
        const arc = arcPoints(nodePositions.get(s)!, nodePositions.get(t)!)
        const color = progressHex(((slugMap.get(s) ?? 0) + (slugMap.get(t) ?? 0)) / 2)
        return { arc, color }
      })
  ), [nodePositions, slugMap])

  return (
    <>
      {edgeData.map(({ arc, color }, i) => (
        <Line key={i} points={arc} color={color} lineWidth={1} transparent opacity={0.18} />
      ))}
      <InstancedPulses arcs={edgeData.map(e => e.arc)} colors={edgeData.map(e => e.color)} />

      {/* Neurons */}
      {topics.map(t => {
        const pos = nodePositions.get(t.slug)!
        const pKnown = slugMap.get(t.slug) ?? 0
        const color = progressHex(pKnown)
        const active = filteredSlugs === null || filteredSlugs.has(t.slug)
        return (
          <Neuron
            key={t.slug}
            position={pos}
            color={color}
            name={t.name}
            slug={t.slug}
            pKnown={pKnown}
            active={active}
            onHover={onHover}
            onClick={onClick}
          />
        )
      })}

      {/* Section labels — only for A-level (Pure / Stats / Mech) */}
      {'Pure Mathematics' in topicCategories && (
        <>
          <Html position={[0, 2.0, 2.1]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.35)',
              borderRadius: 6, padding: '3px 9px', color: '#93c5fd',
              fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em',
              whiteSpace: 'nowrap', textTransform: 'uppercase', backdropFilter: 'blur(4px)',
            }}>PURE</div>
          </Html>
          <Html position={[-2.3, 0.3, -1.2]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
              borderRadius: 6, padding: '3px 9px', color: '#fcd34d',
              fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em',
              whiteSpace: 'nowrap', textTransform: 'uppercase', backdropFilter: 'blur(4px)',
            }}>STATS</div>
          </Html>
          <Html position={[2.3, -0.3, -1.2]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.35)',
              borderRadius: 6, padding: '3px 9px', color: '#c4b5fd',
              fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em',
              whiteSpace: 'nowrap', textTransform: 'uppercase', backdropFilter: 'blur(4px)',
            }}>MECH</div>
          </Html>
        </>
      )}
    </>
  )
}

// ── Main exported scene ───────────────────────────────────────────────────────
export default function BrainScene({ progress, onHover, onClick, sectionFilter, topics, topicCategories }: {
  progress: StudentProgress[]
  onHover: (info: { name: string; slug: string; pKnown: number } | null) => void
  onClick: (slug: string) => void
  sectionFilter: string | null
  topics: Omit<Topic, 'id' | 'parent_id'>[]
  topicCategories: Record<string, string[]>
}) {
  const handleHover = useCallback(onHover, [onHover])
  const handleClick = useCallback(onClick, [onClick])
  const [h, setH] = useState(0)

  useEffect(() => {
    setH(window.innerHeight)
    const onResize = () => setH(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (!h) return null

  return (
    <div style={{ width: '100%', height: h, position: 'relative' }}>
      <CanvasErrorBoundary fallback={<div style={{ width: '100%', height: h, background: '#060d1f' }} />}>
        <Canvas
          style={{ width: '100%', height: h }}
          camera={{ position: [0, 0, 7], fov: 50 }}
          dpr={1}
          performance={{ min: 0.5 }}
          gl={{ antialias: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: false }}>
          <color attach="background" args={['#060d1f']} />
          <ambientLight intensity={0.12} />
          {/* Key light — catches gyri peaks on the top-front */}
          <pointLight position={[5, 7, 5]} color="#f59e0b" intensity={4} />
          {/* Fill from upper-left to show longitudinal fissure */}
          <pointLight position={[-5, 5, 3]} color="#fbbf24" intensity={2.5} />
          {/* Rim light from behind — separates brain from background */}
          <pointLight position={[0, -2, -8]} color="#ea580c" intensity={3} />
          {/* Under-light — catches temporal lobes and brainstem */}
          <pointLight position={[0, -7, 3]} color="#7c2d12" intensity={1.5} />
          {/* Side fill — reveals Sylvian fissure depth */}
          <pointLight position={[9, 0, 0]} color="#c05000" intensity={2} />
          <pointLight position={[-9, 0, 0]} color="#c05000" intensity={2} />

          <group>
            <BrainMesh />
            <HoloRings />
            <NeuralScene progress={progress} onHover={handleHover} onClick={handleClick} sectionFilter={sectionFilter} topics={topics} topicCategories={topicCategories} />
          </group>
          <OrbitControls enablePan={false} minDistance={4} maxDistance={14} autoRotate autoRotateSpeed={0.5} />

        </Canvas>
      </CanvasErrorBoundary>

      {/* Scan lines overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(245,158,11,0.008) 2px, rgba(245,158,11,0.008) 4px)',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(2,4,10,0.6) 100%)',
      }} />

    </div>
  )
}
