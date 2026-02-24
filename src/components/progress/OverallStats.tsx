import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Target } from "lucide-react";

interface OverallStatsProps {
  totalClasses: number;
  attendanceRate: number;
}

export function OverallStats({ totalClasses, attendanceRate }: OverallStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-neutral-900 border-neutral-800 text-white relative overflow-hidden group">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              Total Histórico
            </span>
            <Dumbbell className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="text-4xl font-black text-white tracking-tighter group-hover:text-red-500 transition-colors">
              {totalClasses}
            </div>
            <p className="text-sm text-neutral-400 mt-1">
              Aulas completadas
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Dumbbell className="w-24 h-24 rotate-12" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border-neutral-800 text-white relative overflow-hidden group">
        <CardContent className="p-6 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              Presença Geral
            </span>
            <Target className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-4xl font-black text-white tracking-tighter group-hover:text-emerald-500 transition-colors">
              {attendanceRate}%
            </div>
            <p className="text-sm text-neutral-400 mt-1">
              Taxa de comparecimento
            </p>
          </div>
          
          {/* Progress Bar Visual */}
          <div className="w-full h-1 bg-neutral-800 mt-4 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>

          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target className="w-24 h-24 rotate-12" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
