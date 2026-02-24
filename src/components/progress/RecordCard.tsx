import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface RecordCardProps {
  streak: number;
}

export function RecordCard({ streak }: RecordCardProps) {
  return (
    <Card className="bg-neutral-900 border-neutral-800 text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Trophy className="w-32 h-32 rotate-12" />
      </div>
      
      <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
        <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              Recorde Pessoal
            </span>
            <Trophy className="w-5 h-5 text-yellow-500 animate-pulse" />
        </div>
      
        <div className="flex flex-col gap-1">
          <div className="text-4xl font-black text-white tracking-tighter group-hover:text-yellow-500 transition-colors">
            {streak}
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Dias consecutivos
          </p>
          <p className="text-sm text-neutral-400 font-medium mt-4 max-w-[200px] border-t border-neutral-800 pt-2">
            Sua maior sequência de treinos até hoje.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
