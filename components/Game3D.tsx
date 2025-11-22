import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { GameStatus, LANE_WIDTH, PLAYER_SPEED_LATERAL } from '../types';

// --- Assets & Styles ---
// Neon materials
const neonBlueMaterial = new THREE.MeshStandardMaterial({ 
  color: '#00ffff', emissive: '#00ffff', emissiveIntensity: 2, roughness: 0.2, metalness: 0.8 
});
const neonPinkMaterial = new THREE.MeshStandardMaterial({ 
  color: '#ff00ff', emissive: '#ff00ff', emissiveIntensity: 2, roughness: 0.2, metalness: 0.8 
});
const carBodyMaterial = new THREE.MeshStandardMaterial({ 
  color: '#1a1a1a', roughness: 0.3, metalness: 0.9 
});
const roadMaterial = new THREE.MeshStandardMaterial({ 
  color: '#0a0a0a', roughness: 0.8 
});

// --- Components ---

const PlayerCar = ({ position, rotationX }: { position: [number, number, number], rotationX: number }) => {
  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} material={carBodyMaterial} castShadow>
        <boxGeometry args={[1, 0.4, 2]} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.6, -0.2]} material={new THREE.MeshStandardMaterial({ color: '#111' })} castShadow>
        <boxGeometry args={[0.8, 0.35, 1]} />
      </mesh>
      {/* Tron Lines */}
      <mesh position={[0, 0.31, 0]} material={neonBlueMaterial}>
         <boxGeometry args={[1.02, 0.1, 2.02]} />
      </mesh>
      {/* Wheels */}
      <mesh position={[-0.6, 0.25, 0.6]} rotation={[0, 0, rotationX]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.6, 0.25, 0.6]} rotation={[0, 0, rotationX]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.6, 0.25, -0.6]} rotation={[0, 0, rotationX]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.6, 0.25, -0.6]} rotation={[0, 0, rotationX]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Headlights */}
      <pointLight position={[0, 0.5, -1.2]} intensity={2} distance={10} color="#00ffff" />
      
      {/* Tail lights trail */}
      <group position={[0, 0.4, 1]}>
         <mesh position={[-0.3, 0, 0]} material={neonPinkMaterial}>
            <boxGeometry args={[0.2, 0.1, 0.1]} />
         </mesh>
         <mesh position={[0.3, 0, 0]} material={neonPinkMaterial}>
            <boxGeometry args={[0.2, 0.1, 0.1]} />
         </mesh>
      </group>
    </group>
  );
};

const EnemyCar = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
       <mesh position={[0, 0.3, 0]} material={carBodyMaterial} castShadow>
        <boxGeometry args={[1, 0.5, 2]} />
      </mesh>
      <mesh position={[0, 0.3, 0]} material={neonPinkMaterial}>
         <boxGeometry args={[1.05, 0.1, 2.05]} />
      </mesh>
      {/* Angry Eyes */}
       <mesh position={[-0.3, 0.4, 1]} material={neonPinkMaterial}>
          <boxGeometry args={[0.2, 0.1, 0.1]} />
       </mesh>
       <mesh position={[0.3, 0.4, 1]} material={neonPinkMaterial}>
          <boxGeometry args={[0.2, 0.1, 0.1]} />
       </mesh>
    </group>
  );
};

const Road = ({ speedOffset }: { speedOffset: number }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (mesh.current) {
        // Move texture coordinate to simulate speed
        // We'd need a texture for this, but let's use a simple grid trick
    }
  });

  return (
    <group>
      {/* Main Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]} receiveShadow>
        <planeGeometry args={[LANE_WIDTH * 4, 100]} />
        <meshStandardMaterial color="#111" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Grid Lines Floor */}
      <gridHelper args={[100, 50, 0xff00ff, 0x222222]} position={[0, 0.01, 0]} />
    </group>
  );
};

const MovingLines = ({ speed }: { speed: number }) => {
    const lines = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (lines.current) {
            lines.current.position.z += speed * 20 * delta;
            if (lines.current.position.z > 10) {
                lines.current.position.z = 0;
            }
        }
    });

    return (
        <group ref={lines}>
            {[-1, 1].map((side, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[side * LANE_WIDTH * 1.5, 0.02, -25]}>
                    <planeGeometry args={[0.2, 100]} />
                    <meshBasicMaterial color="#00ffff" opacity={0.5} transparent />
                </mesh>
            ))}
        </group>
    )
}

// --- Main Game Loop Component ---

interface GameLogicProps {
  status: GameStatus;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  controls: { current: { x: number, speed: number } }; // Ref based inputs for performance
}

const GameLogic: React.FC<GameLogicProps> = ({ status, onGameOver, onScoreUpdate, controls }) => {
  const playerRef = useRef<THREE.Group>(null);
  const [enemies, setEnemies] = useState<{id: number, x: number, z: number}[]>([]);
  const stateRef = useRef({
    score: 0,
    distance: 0,
    lastSpawnZ: -30,
    speed: 0,
    playerX: 0,
    gameTime: 0
  });

  // Reset game
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
        stateRef.current = { score: 0, distance: 0, lastSpawnZ: -30, speed: 0, playerX: 0, gameTime: 0 };
        setEnemies([]);
        // Initial enemies
        spawnEnemy(-30);
        spawnEnemy(-60);
    }
  }, [status]);

  const spawnEnemy = (zPos: number) => {
     const lanes = [-LANE_WIDTH, 0, LANE_WIDTH];
     const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
     setEnemies(prev => [...prev, { id: Math.random(), x: randomLane, z: zPos }]);
  };

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;

    const s = stateRef.current;
    
    // 1. Handle Input & Player Movement
    // Smooth interpolation for X position
    const targetX = controls.current.x * LANE_WIDTH;
    s.playerX = THREE.MathUtils.lerp(s.playerX, targetX, delta * 5);
    
    // Acceleration/Deceleration logic
    const targetSpeed = controls.current.speed;
    s.speed = THREE.MathUtils.lerp(s.speed, targetSpeed, delta * 2);

    if (playerRef.current) {
        playerRef.current.position.x = s.playerX;
        // visual tilt
        playerRef.current.rotation.z = (s.playerX - targetX) * 0.5; 
        // visual pitch on acceleration
        playerRef.current.rotation.x = s.speed * 0.1; 
    }

    // 2. Move World (Simulate Speed)
    // We move enemies towards +Z. Player stays at Z=0 approximately.
    const moveDist = s.speed * delta * 30; // Multiplier for game feel
    s.distance += moveDist;
    s.score = Math.floor(s.distance);
    onScoreUpdate(s.score);

    // Update Enemies
    setEnemies(prev => {
        const nextEnemies = [];
        for (const enemy of prev) {
            // Move enemy towards player (relative motion)
            const newZ = enemy.z + moveDist;

            // Collision Detection
            // Player box approx: width 1, length 2
            const dz = newZ - 0; // Player is at 0
            const dx = enemy.x - s.playerX;
            
            // Hitbox check
            if (Math.abs(dx) < 1.2 && Math.abs(dz) < 2.2) {
                onGameOver(s.score);
            }

            if (newZ < 10) { // Keep if not passed camera
                nextEnemies.push({ ...enemy, z: newZ });
            }
        }
        return nextEnemies;
    });

    // Spawning Logic
    // Logic: Spawn new enemy every X units of distance
    // Using a ref to track virtual world position for spawning
    s.lastSpawnZ += moveDist;
    if (s.lastSpawnZ > 0) { // Threshold reached
        spawnEnemy(-50 - (Math.random() * 20)); // Spawn far ahead
        s.lastSpawnZ = -30; // Reset counter equivalent
    }
    
    // Camera Follow Shake
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, s.playerX * 0.3, delta);
    
    if (state.camera instanceof THREE.PerspectiveCamera) {
      state.camera.fov = 75 + (s.speed * 20);
      state.camera.updateProjectionMatrix();
    }

  });

  return (
    <>
      <group ref={playerRef} position={[0,0,0]}>
         <PlayerCar position={[0,0,0]} rotationX={Date.now() / 100} />
      </group>
      
      {enemies.map(e => (
        <EnemyCar key={e.id} position={[e.x, 0, e.z]} />
      ))}
      
      <Road speedOffset={stateRef.current.distance} />
      <MovingLines speed={stateRef.current.speed} />
    </>
  );
};

// --- Main Canvas Wrapper ---

interface GameCanvasProps {
    status: GameStatus;
    onGameOver: (score: number) => void;
    onScoreUpdate: (score: number) => void;
    inputState: { x: number, speed: number };
}

export const Game3D: React.FC<GameCanvasProps> = ({ status, onGameOver, onScoreUpdate, inputState }) => {
    const controlsRef = useRef(inputState);
    
    // Sync prop input to ref for the render loop
    useEffect(() => {
        controlsRef.current = inputState;
    }, [inputState]);

    return (
        <div className="absolute inset-0 z-0">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 3, 6]} fov={75} />
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 5, 60]} />
                
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />
                
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Environment preset="city" />

                <GameLogic 
                    status={status} 
                    onGameOver={onGameOver} 
                    onScoreUpdate={onScoreUpdate}
                    controls={controlsRef}
                />
                
                {/* Retro Grid Floor Effect */}
                <gridHelper args={[200, 50, 0x222222, 0x111111]} position={[0, -0.1, 0]} />
            </Canvas>
        </div>
    );
};