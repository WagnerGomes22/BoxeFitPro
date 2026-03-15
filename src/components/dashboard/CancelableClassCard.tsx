"use client";

import { ClassCard } from "@/components/dashboard/ClassCard";
import { cancelBooking } from "@/actions/booking/cancel-booking";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CancelableClassCardProps extends React.ComponentProps<typeof ClassCard> {
  bookingId: string;
}

export function CancelableClassCard({ bookingId, ...props }: CancelableClassCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    setShowConfirmDialog(false);

    try {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao cancelar aula.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar sua presença nesta aula? Esta ação não pode ser desfeita e você poderá perder sua vaga.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              Sim, cancelar aula
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className={isCancelling ? "opacity-50 pointer-events-none" : ""}>
        <ClassCard 
          {...props} 
          onCancel={() => setShowConfirmDialog(true)} 
        />
      </div>
    </>
  );
}
