import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Procedural Cybernetic Head & Body Model
function SentinelMesh({ mousePos, targetFocus, reducedMotion }) {
  const rootGroupRef = useRef();
  const bodyGroupRef = useRef();
  const neckGroupRef = useRef();
  const headGroupRef = useRef();
  const eyeLightRef = useRef();
  const ocularDotRef = useRef();
  const coreReactorRef = useRef();

  const currentHeadYaw = useRef(0);
  const currentHeadPitch = useRef(0);
  const currentHeadRoll = useRef(0);
  const currentBodyYaw = useRef(0);
  const currentBodyPitch = useRef(0);
  const currentLightX = useRef(0);
  const currentLightY = useRef(0);

  const materials = useMemo(() => {
    return {
      glossyArmor: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0A1124'),
        roughness: 0.16,
        metalness: 0.88
      }),
      graphiteInner: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1E293B'),
        roughness: 0.42,
        metalness: 0.65
      }),
      gunmetal: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0F172A'),
        roughness: 0.3,
        metalness: 0.95
      }),
      emissiveBlue: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#000000'),
        emissive: new THREE.Color('#2563EB'),
        emissiveIntensity: 2.8,
        roughness: 0.1
      }),
      emissiveCyan: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#000000'),
        emissive: new THREE.Color('#38BDF8'),
        emissiveIntensity: 3.5,
        roughness: 0.05
      }),
      reactorCore: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#000000'),
        emissive: new THREE.Color('#3B82F6'),
        emissiveIntensity: 3.2,
        roughness: 0.2
      })
    };
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (reducedMotion) {
      if (rootGroupRef.current) {
        rootGroupRef.current.position.y = -0.15;
      }
      return;
    }

    let targetYaw = mousePos.x * 0.42;
    let targetPitch = -mousePos.y * 0.24;
    let targetRoll = -mousePos.x * 0.06;

    if (targetFocus === 'cta-primary') {
      targetYaw += 0.12;
      targetPitch -= 0.08;
    } else if (targetFocus === 'cta-secondary') {
      targetYaw -= 0.12;
      targetPitch -= 0.06;
    } else if (targetFocus === 'auth') {
      targetYaw += 0.18;
      targetPitch += 0.14;
    }

    const isIdle = Math.abs(mousePos.vx) < 0.001 && Math.abs(mousePos.vy) < 0.001;
    const idleFloat = Math.sin(time * 0.7) * 0.025;
    const idleYaw = isIdle ? Math.sin(time * 0.5) * 0.015 : 0;
    const idlePitch = isIdle ? Math.cos(time * 0.6) * 0.01 : 0;

    targetYaw += idleYaw;
    targetPitch += idlePitch;

    const velocityMag = Math.sqrt(mousePos.vx * mousePos.vx + mousePos.vy * mousePos.vy);
    const lerpSpeed = Math.min(0.14, Math.max(0.06, 0.07 + velocityMag * 0.5));

    currentHeadYaw.current += (targetYaw - currentHeadYaw.current) * lerpSpeed;
    currentHeadPitch.current += (targetPitch - currentHeadPitch.current) * lerpSpeed;
    currentHeadRoll.current += (targetRoll - currentHeadRoll.current) * lerpSpeed;

    currentBodyYaw.current += (targetYaw * 0.12 - currentBodyYaw.current) * (lerpSpeed * 0.6);
    currentBodyPitch.current += (targetPitch * 0.08 - currentBodyPitch.current) * (lerpSpeed * 0.6);

    if (headGroupRef.current) {
      headGroupRef.current.rotation.y = currentHeadYaw.current;
      headGroupRef.current.rotation.x = currentHeadPitch.current;
      headGroupRef.current.rotation.z = currentHeadRoll.current;
    }

    if (neckGroupRef.current) {
      neckGroupRef.current.rotation.y = currentHeadYaw.current * 0.28;
      neckGroupRef.current.rotation.x = currentHeadPitch.current * 0.22;
    }

    if (bodyGroupRef.current) {
      bodyGroupRef.current.rotation.y = currentBodyYaw.current;
      bodyGroupRef.current.rotation.x = currentBodyPitch.current;
      bodyGroupRef.current.position.y = -0.45 + idleFloat;
    }

    if (eyeLightRef.current) {
      currentLightX.current += (mousePos.x * 1.8 - currentLightX.current) * 0.08;
      currentLightY.current += (mousePos.y * 1.4 + 0.6 - currentLightY.current) * 0.08;
      eyeLightRef.current.position.set(currentLightX.current, currentLightY.current, 2.2);
    }

    if (ocularDotRef.current) {
      ocularDotRef.current.position.x = THREE.MathUtils.clamp(mousePos.x * 0.18, -0.16, 0.16);
      ocularDotRef.current.position.y = THREE.MathUtils.clamp(mousePos.y * 0.06, -0.04, 0.04);
    }

    if (coreReactorRef.current) {
      const pulse = 2.4 + Math.sin(time * 2.2) * 0.8;
      materials.reactorCore.emissiveIntensity = pulse;
    }
  });

  return (
    <group ref={rootGroupRef} position={[0, -0.15, 0]} scale={[1.15, 1.15, 1.15]}>
      <pointLight
        ref={eyeLightRef}
        color="#38BDF8"
        intensity={2.2}
        distance={6}
        decay={2}
        position={[0, 0.6, 2.2]}
      />

      <group ref={bodyGroupRef} position={[0, -0.45, 0]}>
        <mesh position={[0, 0, -0.05]} material={materials.glossyArmor}>
          <boxGeometry args={[1.5, 0.7, 0.55]} />
        </mesh>

        <mesh position={[0, 0.05, 0.22]} material={materials.graphiteInner}>
          <boxGeometry args={[0.5, 0.55, 0.12]} />
        </mesh>

        <group position={[0, 0.08, 0.28]} ref={coreReactorRef}>
          <mesh material={materials.reactorCore}>
            <octahedronGeometry args={[0.11, 1]} />
          </mesh>
          <mesh material={materials.emissiveCyan}>
            <torusGeometry args={[0.15, 0.015, 16, 32]} />
          </mesh>
        </group>

        <group position={[-0.95, 0.2, -0.05]} rotation={[0, 0, -0.2]}>
          <mesh material={materials.glossyArmor}>
            <cylinderGeometry args={[0.22, 0.35, 0.45, 16]} />
          </mesh>
          <mesh position={[-0.05, 0.08, 0.15]} material={materials.emissiveBlue}>
            <boxGeometry args={[0.18, 0.02, 0.08]} />
          </mesh>
        </group>

        <group position={[0.95, 0.2, -0.05]} rotation={[0, 0, 0.2]}>
          <mesh material={materials.glossyArmor}>
            <cylinderGeometry args={[0.22, 0.35, 0.45, 16]} />
          </mesh>
          <mesh position={[0.05, 0.08, 0.15]} material={materials.emissiveBlue}>
            <boxGeometry args={[0.18, 0.02, 0.08]} />
          </mesh>
        </group>

        <mesh position={[0, 0.35, 0.1]} rotation={[0.4, 0, 0]} material={materials.gunmetal}>
          <boxGeometry args={[0.7, 0.12, 0.3]} />
        </mesh>

        <group ref={neckGroupRef} position={[0, 0.42, 0.02]}>
          <mesh material={materials.gunmetal}>
            <cylinderGeometry args={[0.17, 0.21, 0.3, 20]} />
          </mesh>
          <mesh position={[0, 0.02, 0.14]} material={materials.emissiveCyan}>
            <boxGeometry args={[0.04, 0.22, 0.02]} />
          </mesh>

          <group ref={headGroupRef} position={[0, 0.36, 0.05]}>
            <mesh position={[0, 0.12, 0]} material={materials.glossyArmor}>
              <sphereGeometry args={[0.38, 32, 32]} />
            </mesh>

            <mesh position={[0, -0.14, 0.12]} rotation={[-0.2, 0, 0]} material={materials.graphiteInner}>
              <boxGeometry args={[0.38, 0.34, 0.38]} />
            </mesh>

            <mesh position={[0, 0.02, 0.26]} rotation={[0.05, 0, 0]} material={materials.glossyArmor}>
              <boxGeometry args={[0.42, 0.48, 0.18]} />
            </mesh>

            <group position={[0, 0.06, 0.35]}>
              <mesh material={materials.emissiveBlue}>
                <boxGeometry args={[0.36, 0.085, 0.04]} />
              </mesh>

              <mesh ref={ocularDotRef} position={[0, 0, 0.025]} material={materials.emissiveCyan}>
                <sphereGeometry args={[0.028, 16, 16]} />
              </mesh>

              <mesh position={[0, 0.055, 0.015]} material={materials.gunmetal}>
                <boxGeometry args={[0.4, 0.02, 0.05]} />
              </mesh>
            </group>

            <mesh position={[-0.39, 0.04, 0]} rotation={[0, 0, 1.57]} material={materials.gunmetal}>
              <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
            </mesh>
            <mesh position={[-0.43, 0.04, 0]} rotation={[0, 0, 1.57]} material={materials.emissiveCyan}>
              <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
            </mesh>

            <mesh position={[0.39, 0.04, 0]} rotation={[0, 0, 1.57]} material={materials.gunmetal}>
              <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
            </mesh>
            <mesh position={[0.43, 0.04, 0]} rotation={[0, 0, 1.57]} material={materials.emissiveCyan}>
              <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
            </mesh>

            <mesh position={[0, -0.28, 0.24]} material={materials.emissiveBlue}>
              <boxGeometry args={[0.14, 0.015, 0.02]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export function InteractiveSentinel({ targetFocus = null, className = '', height = '620px' }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, vx: 0, vy: 0 });
  const lastMouse = useRef({ x: 0, y: 0, t: Date.now() });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e) => {
      const now = Date.now();
      const dt = Math.max(1, now - lastMouse.current.t) / 1000;

      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;

      const vx = (nx - lastMouse.current.x) / dt;
      const vy = (ny - lastMouse.current.y) / dt;

      lastMouse.current = { x: nx, y: ny, t: now };
      setMousePos({ x: nx, y: -ny, vx, vy });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: height,
        position: 'relative',
        cursor: 'grab'
      }}
    >
      <Canvas
        camera={{ position: [0, 0.15, 3.7], fov: 36 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.55} color="#E2E8F0" />
        <directionalLight position={[3, 4, 3]} intensity={2.4} color="#FFFFFF" />
        <directionalLight position={[-3, 2, 2]} intensity={1.2} color="#93C5FD" />
        <directionalLight position={[-2, 1, -3]} intensity={4.5} color="#2563EB" />
        <pointLight position={[2, -1, -2]} intensity={2.0} color="#1D4ED8" />

        <SentinelMesh
          mousePos={mousePos}
          targetFocus={targetFocus}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}
