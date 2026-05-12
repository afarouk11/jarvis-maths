'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'

const noise3D = createNoise3D()

function MiniBrainMesh() {
  const groupRef = useRef<THREE.Group>(null)

  const makeHemisphere = useMemo(() => (side: -1 | 1) => {
    const geo = new THREE.SphereGeometry(1, 32, 32)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
      x *= 1.12; y *= 0.92; z *= 1.38
      const len = Math.sqrt(x * x + y * y + z * z)
      const nx = x / len, ny = y / len, nz = z / len
      const n1 = noise3D(nx * 2.2 + side * 3.3, ny * 2.2, nz * 2.2)
      const n2 = noise3D(nx * 5.2 + side * 6.4, ny * 5.2, nz * 5.2)
      const ridged2 = (1 - Math.abs(n2)) - 0.5
      const gyri = n1 * 0.34 + ridged2 * 0.22
      const r = len + gyri
      pos.setXYZ(i, nx * r * 0.97 + side * 0.14, ny * r, nz * r)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  const leftGeo  = useMemo(() => makeHemisphere(-1), [makeHemisphere])
  const rightGeo = useMemo(() => makeHemisphere(1),  [makeHemisphere])

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.6
  })

  return (
    <group ref={groupRef} scale={1.3}>
      <mesh geometry={leftGeo}>
        <meshPhongMaterial color="#0a1a2e" emissive="#c47a20" emissiveIntensity={0.9}
          specular="#aaddff" shininess={90} transparent opacity={0.18}
          side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh geometry={leftGeo}>
        <meshBasicMaterial color="#c47a20" wireframe transparent opacity={0.10} />
      </mesh>
      <mesh geometry={rightGeo}>
        <meshPhongMaterial color="#0a1a2e" emissive="#c47a20" emissiveIntensity={0.9}
          specular="#aaddff" shininess={90} transparent opacity={0.18}
          side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh geometry={rightGeo}>
        <meshBasicMaterial color="#c47a20" wireframe transparent opacity={0.10} />
      </mesh>
    </group>
  )
}

export function BrainMini() {
  return (
    <Canvas
      style={{ width: 36, height: 36 }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={1}
      gl={{ antialias: false, powerPreference: 'low-power', alpha: true }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[3, 4, 3]} color="#f59e0b" intensity={3} />
      <pointLight position={[0, -3, -4]} color="#ea580c" intensity={1.5} />
      <MiniBrainMesh />
    </Canvas>
  )
}
