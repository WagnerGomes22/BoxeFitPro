"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ActivityGaugeProps {
  value: number; // 0 a 100
  size?: number;
  strokeWidth?: number;
}

export function ActivityGauge({ value, size = 80, strokeWidth = 8 }: ActivityGaugeProps) {
  const data = [
    { name: "Completed", value: value },
    { name: "Remaining", value: 100 - value },
  ];
  
  // Cores são definidas diretamente no Cell ou CSS, não precisamos de array COLORS aqui

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size / 2 - strokeWidth}
            outerRadius={size / 2}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? "hsl(var(--primary))" : "hsl(var(--muted))"} 
                className="transition-all duration-500 ease-out"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-foreground">{value}%</span>
      </div>
    </div>
  );
}
