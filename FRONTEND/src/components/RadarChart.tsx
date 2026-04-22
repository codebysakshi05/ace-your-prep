import React from 'react';
import { motion } from 'framer-motion';

interface RadarData {
  subject: string;
  value?: number;
  A?: number;
  B?: number;
  benchmark?: number;
}

interface RadarChartProps {
  data: RadarData[];
  size?: number;
  primaryKey?: string;
  secondaryKey?: string;
}

export const CustomRadarChart: React.FC<RadarChartProps> = ({ 
  data, 
  size = 400, 
  primaryKey = 'A', 
  secondaryKey = 'B' 
}) => {
  const center = size / 2;
  const radius = size * 0.35;
  const angleStep = (Math.PI * 2) / data.length;

  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (Math.min(Math.max(value, 0), 100) / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const currentPath = data.map((d: any, i) => {
    const p = getPoint(i, d[primaryKey] || d.value || 0);
    return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }).join(' ') + ' Z';

  const secondaryPath = data.map((d: any, i) => {
    const p = getPoint(i, d[secondaryKey] || d.benchmark || 0);
    return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }).join(' ') + ' Z';

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {/* Background Grids */}
      {[0.2, 0.4, 0.6, 0.8, 1.0].map((tick) => (
        <polygon
          key={tick}
          points={data.map((_, i) => {
            const p = getPoint(i, tick * 100);
            return `${p.x},${p.y}`;
          }).join(' ')}
          className="fill-none stroke-slate-200 dark:stroke-white/5 stroke-1"
        />
      ))}
      
      {/* Axis Lines */}
      {data.map((d, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} className="stroke-slate-200 dark:stroke-white/5 stroke-1" />;
      })}

      {/* Secondary/Benchmark Polygon */}
      <motion.path
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        d={secondaryPath}
        className="fill-rose-500 stroke-rose-400 stroke-1"
        strokeDasharray="4 4"
      />

      {/* Primary Performance Polygon */}
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        d={currentPath}
        className="fill-indigo-600 stroke-indigo-500 stroke-2"
      />

      {/* Labels */}
      {data.map((d, i) => {
        const p = getPoint(i, 115);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-500 dark:fill-slate-300 font-bold text-[10px] uppercase tracking-tighter"
          >
            {d.subject}
          </text>
        );
      })}
    </svg>
  );
};
