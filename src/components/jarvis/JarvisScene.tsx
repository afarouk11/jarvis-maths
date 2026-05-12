'use client'

import { useRef, useMemo, useState, Component, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { JarvisState } from '@/types'

// Catches WebGL context-loss crashes and remounts the canvas cleanly
class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { crashed: boolean; key: number }
> {
  constructor(props: any) {
    super(props)
    this.state = { crashed: false, key: 0 }
  }
  static getDerivedStateFromError() {
    return { crashed: true }
  }
  componentDidCatch() {
    // Remount after a short delay to let the GPU recover
    setTimeout(() => this.setState(s => ({ crashed: false, key: s.key + 1 })), 1500)
  }
  render() {
    if (this.state.crashed) return this.props.fallback
    return <div key={this.state.key}>{this.props.children}</div>
  }
}

const DEG = Math.PI / 180
const GOLD   = '#f59e0b'
const GOLD2  = '#fbbf24'
const GOLD3  = '#fde68a'
const GREEN  = '#4ade80'

// ── Orbital ring ────────────────────────────────────────────────────────────
// A single glowing ring (LineLoop) at a given radius and rotation

function OrbitalRing({
  radius, rx = 0, ry = 0, rz = 0, opacity = 0.7, speed = 0.2, color = GOLD,
}: {
  radius: number; rx?: number; ry?: number; rz?: number
  opacity?: number; speed?: number; color?: string
}) {
  const ref = useRef<THREE.Group>(null)

  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [radius])

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed
  })

  return (
    <group ref={ref} rotation={[rx * DEG, ry * DEG, rz * DEG]}>
      {/* @ts-ignore */}
      <line geometry={geo}>
        <lineBasicMaterial color={color} transparent opacity={opacity} />
      </line>
    </group>
  )
}

// ── Tick marks on a ring ────────────────────────────────────────────────────

function RingTicks({
  radius, count = 32, rx = 0, ry = 0, rz = 0, color = GOLD,
}: {
  radius: number; count?: number; rx?: number; ry?: number; rz?: number; color?: string
}) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < count; i++) {
      const a    = (i / count) * Math.PI * 2
      const inner = radius - 0.06
      const outer = radius + 0.06
      pts.push(new THREE.Vector3(Math.cos(a) * inner, Math.sin(a) * inner, 0))
      pts.push(new THREE.Vector3(Math.cos(a) * outer, Math.sin(a) * outer, 0))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [radius, count])

  return (
    <group rotation={[rx * DEG, ry * DEG, rz * DEG]}>
      {/* @ts-ignore */}
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </lineSegments>
    </group>
  )
}

// ── Icosahedron wireframe cage ──────────────────────────────────────────────

function WireframeCage({ detail = 2, radius = 1.7, opacity = 0.18, color = GOLD }: {
  detail?: number; radius?: number; opacity?: number; color?: string
}) {
  return (
    <mesh>
      <icosahedronGeometry args={[radius, detail]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={opacity} />
    </mesh>
  )
}

// ── Neural node particles ───────────────────────────────────────────────────

function spherePoints(n: number, r: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const g = Math.PI * (1 + Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const theta = Math.acos(1 - 2 * (i + 0.5) / n)
    const phi   = g * i
    pts.push(new THREE.Vector3(r * Math.sin(theta) * Math.cos(phi), r * Math.sin(theta) * Math.sin(phi), r * Math.cos(theta)))
  }
  return pts
}

function NeuralNet({ amplitude, color }: { amplitude: number; color: string }) {
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef  = useRef<THREE.LineSegments>(null)

  const N = 72
  const R = 1.65

  const { pointGeo, lineGeo } = useMemo(() => {
    const nodes = spherePoints(N, R)

    const pPos = new Float32Array(nodes.length * 3)
    nodes.forEach((n, i) => pPos.set([n.x, n.y, n.z], i * 3))
    const pointGeo = new THREE.BufferGeometry()
    pointGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))

    const lineVerts: number[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 0.72) {
          lineVerts.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z)
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3))

    return { pointGeo, lineGeo }
  }, [])

  useFrame(() => {
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial
      mat.size    = 0.025 + amplitude * 0.05
      mat.opacity = 0.7  + amplitude * 0.3
    }
    if (linesRef.current) {
      const mat = linesRef.current.material as THREE.LineBasicMaterial
      mat.opacity = 0.2 + amplitude * 0.5
    }
  })

  return (
    <>
      <points ref={pointsRef} geometry={pointGeo}>
        <pointsMaterial color={color} size={0.03} sizeAttenuation transparent opacity={0.8} />
      </points>
      {/* @ts-ignore */}
      <lineSegments ref={linesRef} geometry={lineGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.25} />
      </lineSegments>
    </>
  )
}

// ── Glowing core ────────────────────────────────────────────────────────────

function GlowCore({ amplitude, state }: { amplitude: number; state: JarvisState }) {
  const innerRef = useRef<THREE.Mesh>(null)
  const outerRef = useRef<THREE.Mesh>(null)

  useFrame((_, dt) => {
    if (innerRef.current) {
      const mat = innerRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.5 + amplitude * 4
      innerRef.current.rotation.y += dt * 0.8
      innerRef.current.rotation.z += dt * 0.4
    }
    if (outerRef.current) {
      const mat = outerRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.12 + amplitude * 0.25
    }
  })

  const coreColor = state === 'listening' ? '#22c55e' : '#fde68a'
  const emissive  = state === 'listening' ? '#15803d' : '#d97706'

  return (
    <>
      {/* Bright inner core */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial
          color={coreColor} emissive={emissive} emissiveIntensity={2}
          transparent opacity={0.9} roughness={0} metalness={1} wireframe />
      </mesh>

      {/* Soft outer glow sphere */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color={coreColor} emissive={emissive} emissiveIntensity={0.6}
          transparent opacity={0.15} roughness={1} side={THREE.FrontSide} />
      </mesh>
    </>
  )
}

// ── Full scene ───────────────────────────────────────────────────────────────

function Scene({ amplitude, state }: { amplitude: number; state: JarvisState }) {
  const masterRef = useRef<THREE.Group>(null)
  const innerRef  = useRef<THREE.Group>(null)

  const color = state === 'listening' ? GREEN : GOLD
  const color2 = state === 'listening' ? '#22c55e' : GOLD2

  const rotSpeed = state === 'thinking' ? 0.5 : state === 'speaking' ? 0.35 : 0.12

  useFrame((_, dt) => {
    if (masterRef.current) {
      masterRef.current.rotation.y += dt * rotSpeed * 0.4
      masterRef.current.rotation.x += dt * rotSpeed * 0.15

      const target = 1 + amplitude * 0.4
      masterRef.current.scale.lerp(
        new THREE.Vector3(target, target, target),
        amplitude > 0.05 ? 0.25 : 0.05
      )
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= dt * 0.2
    }
  })

  return (
    <group ref={masterRef}>
      {/* Orbital rings */}
      <OrbitalRing radius={2.1} rx={0}   ry={0}  rz={0}  opacity={0.65} speed={0.08}  color={color} />
      <OrbitalRing radius={2.1} rx={60}  ry={20} rz={0}  opacity={0.55} speed={-0.06} color={color} />
      <OrbitalRing radius={2.1} rx={90}  ry={0}  rz={30} opacity={0.45} speed={-0.09} color={color2} />

      {/* Tick marks */}
      <RingTicks radius={2.1} count={32} rx={0}  ry={0}  rz={0}  color={color} />

      {/* Mid-layer rings */}
      <OrbitalRing radius={1.5} rx={45} ry={0}  rz={0}  opacity={0.35} speed={0.15}  color={color2} />
      <OrbitalRing radius={1.5} rx={75} ry={90} rz={45} opacity={0.3}  speed={0.1}   color={color} />

      {/* Wireframe panel cage */}
      <group ref={innerRef}>
        <WireframeCage detail={2} radius={1.75} opacity={0.2}  color={color} />
        <WireframeCage detail={1} radius={1.35} opacity={0.25} color={color2} />
      </group>

      {/* Neural network */}
      <NeuralNet amplitude={amplitude} color={color} />

      {/* Glowing core */}
      <GlowCore amplitude={amplitude} state={state} />
    </group>
  )
}

// ── Clickable hit sphere ─────────────────────────────────────────────────────

function HitSphere({ onClick }: { onClick?: () => void }) {
  const ref = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = hovered ? 0.06 : 0
    }
    document.body.style.cursor = hovered ? 'pointer' : 'default'
  })

  return (
    <mesh
      ref={ref}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}>
      <sphereGeometry args={[2.2, 32, 32]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={0} />
    </mesh>
  )
}

// ── Canvas export ────────────────────────────────────────────────────────────

interface Props {
  amplitude: number
  state: JarvisState
  className?: string
  onClick?: () => void
}

export function JarvisScene({ amplitude, state, className, onClick }: Props) {
  const canvas = (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 42 }}
      dpr={1}
      performance={{ min: 0.5 }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: 'low-power',
        failIfMajorPerformanceCaveat: false,
      }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        const ctx = gl.getContext()
        if (!ctx) return
        ctx.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault() }, false)
      }}>
      <ambientLight intensity={0.05} />
      <pointLight position={[4,  4,  4]}  color={state === 'listening' ? '#22c55e' : '#f59e0b'} intensity={1.5} />
      <pointLight position={[-3, -3, -4]} color="#1e3a8a" intensity={0.6} />
      <Scene amplitude={amplitude} state={state} />
      <HitSphere onClick={onClick} />
    </Canvas>
  )

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <CanvasErrorBoundary fallback={<div className="w-full h-full" />}>
        {canvas}
      </CanvasErrorBoundary>
    </div>
  )
}
