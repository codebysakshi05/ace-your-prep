import { motion } from 'framer-motion';

export function SkeletonBase({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div 
      className={`overflow-hidden relative bg-slate-100 border border-slate-200 ${className}`}
      style={style}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/50 to-transparent"
      />
    </div>
  );
}

export function SkeletonMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card p-10 space-y-10">
          <div className="flex items-center gap-6">
            <SkeletonBase className="w-16 h-16 rounded-[1.5rem]" />
            <div className="space-y-2">
              <SkeletonBase className="w-20 h-3 rounded-full" />
              <SkeletonBase className="w-16 h-8 rounded-lg" />
            </div>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between">
                <SkeletonBase className="w-16 h-2 rounded-full" />
                <SkeletonBase className="w-10 h-4 rounded-full" />
             </div>
             <SkeletonBase className="w-full h-2.5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-12 h-[500px] flex flex-col">
       <div className="flex justify-between items-center mb-12">
          <SkeletonBase className="w-48 h-8 rounded-lg" />
          <SkeletonBase className="w-24 h-6 rounded-full" />
       </div>
       <div className="flex-grow flex items-end gap-4 p-4">
          {[...Array(12)].map((_, i) => (
            <SkeletonBase 
              key={i} 
              className="flex-grow rounded-t-xl" 
              style={{ height: `${20 + Math.random() * 60}%` }} 
            />
          ))}
       </div>
       <div className="mt-8 flex justify-between">
          {[...Array(7)].map((_, i) => (
            <SkeletonBase key={i} className="w-10 h-2 rounded-full" />
          ))}
       </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="glass-card p-12 space-y-10">
       <SkeletonBase className="w-48 h-8 rounded-lg mb-12" />
       {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-8">
             <SkeletonBase className="w-16 h-16 rounded-2xl shrink-0" />
             <div className="flex-grow space-y-4 py-2">
                <SkeletonBase className="w-1/2 h-4 rounded-lg" />
                <div className="flex justify-between">
                   <SkeletonBase className="w-24 h-2 rounded-full" />
                   <SkeletonBase className="w-16 h-6 rounded-full" />
                </div>
             </div>
          </div>
       ))}
    </div>
  );
}
