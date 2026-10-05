import { type ReactNode, Suspense } from "react";
import { Canvas } from "@react-three/fiber";

interface SceneProps {
  children: ReactNode;
  className?: string;
  /** Disable frame loop when the scene is off-screen/inactive, to save GPU. */
  frameloop?: "always" | "demand" | "never";
}

/**
 * Thin, reusable wrapper around @react-three/fiber's Canvas.
 * Keeps R3F setup (DPR clamping, frameloop control) in one place so
 * future 3D product scenes don't each reinvent canvas configuration.
 *
 * Not used by any section yet — foundation for future real-time 3D work.
 */
export function Scene({ children, className, frameloop = "demand" }: SceneProps) {
  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      frameloop={frameloop}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
