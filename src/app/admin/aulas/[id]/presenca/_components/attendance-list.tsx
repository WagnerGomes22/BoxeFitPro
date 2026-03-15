'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, RotateCcw, Loader2 } from 'lucide-react';
import { updateAttendance } from '@/actions/instructor/update-attendance';
import { BookingStatus } from '@prisma/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Booking {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  status: BookingStatus;
  attendedAt: Date | null;
  markedByName?: string | null;
}

interface AttendanceListProps {
  initialBookings: Booking[];
  isLocked: boolean;
}

export function AttendanceList({ initialBookings, isLocked }: AttendanceListProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    // Optimistic Update
    const previousBookings = [...bookings];
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      )
    );
    setLoadingId(bookingId);

    try {
      const result = await updateAttendance(bookingId, newStatus);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast.success('Presença atualizada!');

    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar presença.";
      setBookings(previousBookings);
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
        <p className="text-zinc-500">Nenhum aluno inscrito nesta aula.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-zinc-200 divide-y divide-zinc-100">
      {bookings.map((booking) => (
        <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 transition-colors">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border border-zinc-200">
              <AvatarImage src={booking.image || ''} alt={booking.name} />
              <AvatarFallback className="bg-zinc-100 text-zinc-500 font-bold">
                {booking.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-zinc-900">{booking.name}</p>
              <p className="text-xs text-zinc-500">{booking.email}</p>
              
              {/* Informação de Auditoria */}
              {(booking.status === 'ATTENDED' || booking.status === 'NO_SHOW') && booking.attendedAt && (
                <p className="text-[10px] text-zinc-400 mt-1">
                  Marcado em {format(new Date(booking.attendedAt), 'HH:mm')}
                  {booking.markedByName && ` por ${booking.markedByName}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isLocked ? (
              <div className="flex items-center gap-2">
                 {booking.status === 'ATTENDED' && (
                    <Badge className="bg-green-600 hover:bg-green-700">PRESENTE</Badge>
                 )}
                 {booking.status === 'NO_SHOW' && (
                    <Badge variant="destructive">FALTOU</Badge>
                 )}
                 {booking.status === 'CONFIRMED' && (
                    <Badge variant="secondary">PENDENTE</Badge>
                 )}
              </div>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-9 w-9 p-0 rounded-full transition-all ${
                    booking.status === 'ATTENDED' 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
                      : 'text-zinc-300 hover:text-green-600 hover:bg-green-50 border border-zinc-200 hover:border-green-200'
                  }`}
                  onClick={() => handleUpdate(booking.id, BookingStatus.ATTENDED)}
                  disabled={loadingId === booking.id}
                  title="Marcar Presença"
                >
                  {loadingId === booking.id && booking.status !== 'ATTENDED' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-9 w-9 p-0 rounded-full transition-all ${
                    booking.status === 'NO_SHOW' 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm' 
                      : 'text-zinc-300 hover:text-red-600 hover:bg-red-50 border border-zinc-200 hover:border-red-200'
                  }`}
                  onClick={() => handleUpdate(booking.id, BookingStatus.NO_SHOW)}
                  disabled={loadingId === booking.id}
                  title="Marcar Falta"
                >
                  {loadingId === booking.id && booking.status !== 'NO_SHOW' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                </Button>

                {/* Botão de Reset (só aparece se já tiver status definido) */}
                {(booking.status === 'ATTENDED' || booking.status === 'NO_SHOW') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 p-0 rounded-full text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100"
                    onClick={() => handleUpdate(booking.id, BookingStatus.CONFIRMED)}
                    disabled={loadingId === booking.id}
                    title="Resetar"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
