import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ActivityGauge } from "./ActivityGauge";
import { Flame, Trophy } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "streak" | "attendance" | "record";
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  description, 
  icon, 
  variant = "default", 
  className 
}: MetricCardProps) {
  const isStreak = variant === "streak";
  const isAttendance = variant === "attendance";
  const isRecord = variant === "record";
  
  return (
    <Card className={cn(
      "border shadow-sm transition-all duration-300 hover:shadow-md h-full overflow-hidden relative",
      // Streak Variant (Orange/Fire)
      isStreak && "bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background border-orange-200/50 dark:border-orange-900/50",
      // Attendance Variant (Emerald/Success)
      isAttendance && "bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background border-emerald-200/50 dark:border-emerald-900/50",
      // Record Variant (Yellow/Gold)
      isRecord && "bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background border-yellow-200/50 dark:border-yellow-900/50",
      // Default Variant
      !isStreak && !isAttendance && !isRecord && "bg-card hover:bg-accent/5",
      className
    )}>
      {/* Background Decorator Icon */}
      {isStreak && <Flame className="absolute -right-4 -bottom-4 w-24 h-24 text-orange-100 dark:text-orange-900/20 -z-0 rotate-12" />}
      {isRecord && <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 text-yellow-100 dark:text-yellow-900/20 -z-0 rotate-12" />}

      <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className={cn(
            "p-2 rounded-full",
            isStreak && "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
            isAttendance && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
            isRecord && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
            !isStreak && !isAttendance && !isRecord && "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        </div>
        
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className={cn(
              "text-3xl font-bold tracking-tight flex items-center gap-2",
              isStreak && "text-orange-600 dark:text-orange-400 font-mono",
              isAttendance && "text-emerald-600 dark:text-emerald-400 font-mono",
              isRecord && "text-yellow-600 dark:text-yellow-400 font-mono",
              !isStreak && !isAttendance && !isRecord && "text-foreground font-mono"
            )}>
              {value}
              {isStreak && <Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-pulse" />}
            </div>
            {description && (
                <p className="text-xs text-muted-foreground font-medium">{description}</p>
            )}
          </div>
          
          {isAttendance && typeof value === 'number' && (
             <div className="w-16 h-16 -mb-2 shrink-0">
                <ActivityGauge value={Number(value)} size={64} strokeWidth={6} />
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
