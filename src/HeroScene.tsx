import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Топографическая 3D-волна с золотым свечением — как на референсе iaroslove */
function GoldenRidge() {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.LineSegments>(null)

  // Геометрия plane с шумовыми высотами
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(14, 7, 80, 40)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      // Многочастотный синус — создаёт холмистый ландшафт
      const z =
        Math.sin(x * 0.6) * 0.35 +
        Math.cos(y * 0.8) * 0.25 +
        Math.sin(x * 1.4 + y * 0.7) * 0.18 +
        Math.cos(x * 0.3 - y * 0.5) * 0.45
      pos.setZ(i, z)
    }
    g.computeVertexNormals()
    return g
  }, [])

  const wireGeometry = useMemo(() => new THREE.WireframeGeometry(geometry), [geometry])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.z = t * 0.05
      meshRef.current.position.y = Math.sin(t * 0.4) * 0.15
    }
    if (wireRef.current) {
      wireRef.current.rotation.z = t * 0.05
      wireRef.current.position.y = Math.sin(t * 0.4) * 0.15
    }
  })

  return (
    <group rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -0.5, 0]}>
      {/* Подложка — мягкий тёмный mesh с золотым освещением */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#1a1208"
          emissive="#E5B247"
          emissiveIntensity={0.08}
          roughness={0.7}
          metalness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Wireframe overlay — золотая сетка */}
      <lineSegments ref={wireRef} geometry={wireGeometry}>
        <lineBasicMaterial color="#E5B247" transparent opacity={0.42} />
      </lineSegments>
    </group>
  )
}

/** Парящие золотые частицы как глоу-точки в воздухе */
function GoldenDust({ count = 60 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4 + 1
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return arr
  }, [count])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < count; i++) {
      const y0 = positions[i * 3 + 1]
      pos.setY(i, y0 + Math.sin(t * 0.5 + i) * 0.25)
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#FFD27A" size={0.06} sizeAttenuation transparent opacity={0.8} />
    </points>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      {/* Тёплое золотое освещение сверху */}
      <pointLight position={[0, 4, 2]} color="#FFC972" intensity={4} distance={10} decay={1.8} />
      <pointLight position={[-3, 1, 3]} color="#E5B247" intensity={2} distance={8} decay={2} />
      {/* Холодное контражурное — деталь premium-сцены */}
      <pointLight position={[3, -2, 2]} color="#A6C8FF" intensity={0.8} distance={6} decay={2} />
      <GoldenRidge />
      <GoldenDust count={50} />
    </>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 1.8, 4.5], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
