import { getInstructors } from "@/actions/admin/get-instructors";
import { getClass } from "@/actions/admin/get-class";
import { EditClassForm } from "../_components/edit-class-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

interface EditClassPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditClassPage({ params }: EditClassPageProps) {
    const { id } = await params;
    
    const [instructors, classData] = await Promise.all([
        getInstructors(),
        getClass(id)
    ]);

    if (!classData) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="h-10 w-10">
                    <Link href="/admin/aulas">
                        <ArrowLeft className="h-5 w-5 text-zinc-500 hover:text-zinc-900" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Editar Aula</h1>
                    <p className="text-sm text-zinc-500">Atualize os dados da aula.</p>
                </div>
            </div>

            <EditClassForm instructors={instructors} classData={classData} />
        </div>
    );
}
