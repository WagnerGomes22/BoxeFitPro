import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, User } from "lucide-react";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  name: string;
  instructor: string;
  isBooked?: boolean;
  bookingId?: string | null;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  isLoading?: boolean;
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}: TimeSlotPickerProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-sm" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-800">
        <Clock className="mx-auto h-8 w-8 mb-2 opacity-30" />
        <p className="font-medium text-sm">Nenhum combate agendado para esta data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
        <Clock className="h-3 w-3" />
        Horários Disponíveis
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slots.map((slot) => {
            const isSelected = selectedSlot === slot.id;
            const isBooked = slot.isBooked;
            const isDisabled = !slot.available && !isBooked;

            return (
              <Button
                key={slot.id}
                variant="outline"
                disabled={isDisabled}
                onClick={() => onSelectSlot(slot.id)}
                className={cn(
                  "h-auto py-4 px-5 transition-all flex flex-col items-start gap-1 relative overflow-hidden border-2 rounded-sm group",
                  // Estados Normais
                  !isSelected && !isBooked && !isDisabled && "bg-white hover:bg-neutral-50 hover:border-red-600/30 border-neutral-200",
                  // Selecionado
                  isSelected && "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 shadow-md",
                  // Desabilitado (Sem Vaga)
                  isDisabled && "bg-neutral-100 text-neutral-400 border-neutral-100 opacity-70",
                  // Já Inscrito
                  isBooked && !isSelected && "bg-neutral-50 border-neutral-200 opacity-100"
                )}
              >
                {/* Indicador de "Já Inscrito" */}
                {isBooked && !isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}

                <div className="flex items-center justify-between w-full mb-1">
                    <span className={cn("text-2xl font-mono font-bold tracking-tighter leading-none", 
                        isSelected ? "text-white" : "text-neutral-900"
                    )}>
                        {slot.time}
                    </span>
                    
                    <div className="flex flex-col items-end">
                        {isBooked ? (
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm",
                                isSelected ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                            )}>
                                Inscrito
                            </span>
                        ) : !slot.available ? (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-neutral-200 text-neutral-500">
                                Esgotado
                            </span>
                        ) : (
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm",
                                isSelected ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
                            )}>
                                Vagas
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-start w-full gap-0.5">
                    <span className={cn("font-bold text-sm leading-tight uppercase", 
                        isSelected ? "text-white" : "text-neutral-700"
                    )}>
                        {slot.name}
                    </span>
                    <span className={cn("text-xs flex items-center gap-1", 
                        isSelected ? "text-white/80" : "text-neutral-500"
                    )}>
                        <User className="h-3 w-3" />
                        Prof. {slot.instructor}
                    </span>
                </div>
              </Button>
            );
        })}
      </div>
    </div>
  );
}
