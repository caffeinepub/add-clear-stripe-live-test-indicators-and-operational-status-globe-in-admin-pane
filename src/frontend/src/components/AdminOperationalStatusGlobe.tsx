import { Globe } from 'lucide-react';

interface AdminOperationalStatusGlobeProps {
  isOperational: boolean;
}

export default function AdminOperationalStatusGlobe({ isOperational }: AdminOperationalStatusGlobeProps) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <Globe
        className={`h-12 w-12 transition-all duration-500 ${
          isOperational
            ? 'text-emerald-500 animate-spin-slow drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]'
            : 'text-muted-foreground'
        }`}
        style={{
          animationDuration: isOperational ? '8s' : '0s',
        }}
      />
      {isOperational && (
        <>
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-2xl" />
        </>
      )}
    </div>
  );
}
