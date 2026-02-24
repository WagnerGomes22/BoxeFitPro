import { getInstructors } from "@/actions/admin/get-instructors";
import { CreateClassForm } from "../_components/create-class-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewClassPage() {
    const instructors = await getInstructors();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="h-10 w-10">
                    <Link href="/admin/aulas">
                        <ArrowLeft className="h-5 w-5 text-zinc-500 hover:text-zinc-900" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Nova Aula</h1>
                    <p className="text-sm text-zinc-500">Preencha os dados para adicionar uma nova aula à grade.</p>
                </div>
            </div>

            <CreateClassForm instructors={instructors} />
        </div>
    );
}
