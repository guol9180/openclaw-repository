/**
 * AI 角色组件
 */

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';
import { useAIRoomStore } from '../../stores/useAIRoomStore';

export function AICharacter() {
  const meshRef = useRef<Mesh>(null);
  const { aiState } = useAIRoomStore();

  // 动画更新
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // 如果有目标位置，移动到目标
    if (aiState.targetPosition) {
      const speed = 2; // 单位/秒
      const dx = aiState.targetPosition.x - aiState.position.x;
      const dz = aiState.targetPosition.z - aiState.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance > 0.1) {
        meshRef.current.position.x += (dx / distance) * speed * delta;
        meshRef.current.position.z += (dz / distance) * speed * delta;
      }
    } else {
      // 同步位置
      meshRef.current.position.set(
        aiState.position.x,
        aiState.position.y + 0.5,
        aiState.position.z
      );
    }

    // 简单的呼吸动画
    meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
      {/* 简单的球体代表 AI */}
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color={getStatusColor(aiState.status)}
        emissive={getStatusColor(aiState.status)}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// 根据状态返回颜色
function getStatusColor(status: string): string {
  switch (status) {
    case 'idle':
      return '#4ade80'; // 绿色
    case 'thinking':
      return '#fbbf24'; // 黄色
    case 'searching':
      return '#60a5fa'; // 蓝色
    case 'using_tool':
      return '#f472b6'; // 粉色
    case 'generating':
      return '#a78bfa'; // 紫色
    default:
      return '#4ade80';
  }
}
