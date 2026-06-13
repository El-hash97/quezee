'use client';
import { cn } from "@/lib/utils";

interface NoiseBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export const NoiseBackground = ({ className, children }: NoiseBackgroundProps) => {
  return (
    <div className={cn("min-h-screen w-full bg-white relative", className)}>
      {/* Noise Texture (Darker Dots) Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default NoiseBackground;
