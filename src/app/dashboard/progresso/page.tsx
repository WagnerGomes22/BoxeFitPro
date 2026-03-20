import { getProgressData } from "@/actions/dashboard/get-progress";
import { HistoryChart } from "@/components/progress/HistoryChart";
import { OverallStats } from "@/components/progress/OverallStats";
import { RecordCard } from "@/components/progress/RecordCard";
import { Trophy, History } from "lucide-react";
import { ContributionGrid } from "@/components/progress/ContributionGrid";
import { HistoryModal } from "@/components/progress/HistoryModal";
import Image from "next/image";

export default async function ProgressPage() {
  const data = await getProgressData();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-foreground uppercase flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Minha Jornada
          </h2>
          <p className="text-muted-foreground">
            Acompanhe sua evolução e quebre seus próprios recordes.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Records */}
        <div className="space-y-6 lg:col-span-1">
            <RecordCard streak={data.longestStreak} />
            <OverallStats 
                totalClasses={data.totalClasses} 
                attendanceRate={data.overallAttendanceRate} 
            />
        </div>

        {/* Right Column: Chart (Takes 2 cols on large screens) */}
        <div className="lg:col-span-2">
            <HistoryChart data={data.monthlyHistory} />
        </div>
      </div>

      {/* Contribution Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-neutral-500" />
                <h3 className="text-lg font-black italic tracking-wider text-foreground uppercase">
                  Frequência de Treinos
                </h3>
            </div>
            <HistoryModal history={data.fullHistory} />
        </div>
        
        <div className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-card overflow-hidden">
            <ContributionGrid data={data.fullHistory} />
        </div>
      </div>
      
      {/* Motivation Banner */}
      <div className="mt-8 relative overflow-hidden rounded-xl bg-black border border-neutral-800">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent z-10" />
          <Image
            src="/images/tyson.jpg"
            alt="Mike Tyson"
            fill
            sizes="100vw"
            className="object-cover grayscale object-[center_35%]"
          />
        </div>
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 min-h-[250px]">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h3 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-tight max-w-2xl drop-shadow-lg">
              &quot;Todo mundo tem um plano <br/> até tomar o primeiro soco na cara.&quot;
            </h3>
            <p className="text-neutral-400 font-medium tracking-widest uppercase text-sm md:text-base border-l-4 border-red-600 pl-4 ml-auto mr-auto md:ml-0 md:mr-0 w-fit">
              — Mike Tyson
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
