"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface HistoryChartProps {
  data: {
    month: string;
    fullDate: string;
    classes: number;
  }[];
}

export function HistoryChart({ data }: HistoryChartProps) {
  return (
    <Card className="h-full border-border/50 shadow-md bg-gradient-to-br from-neutral-900 to-neutral-950 text-white border-neutral-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">Evolução Mensal</CardTitle>
        <CardDescription className="text-neutral-400">
          Quantidade de aulas realizadas nos últimos 12 meses.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClasses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis 
                dataKey="month" 
                stroke="#888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ 
                    backgroundColor: "#171717", 
                    borderColor: "#333", 
                    borderRadius: "8px",
                    color: "#fff"
                }}
                itemStyle={{ color: "#ef4444" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar 
                dataKey="classes" 
                fill="url(#colorClasses)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
