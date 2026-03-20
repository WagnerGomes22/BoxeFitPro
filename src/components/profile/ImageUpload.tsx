"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { updateProfileImage } from "@/actions/user/update-profile-image";

interface ImageUploadProps {
  currentImage: string | null;
  name: string | null;
}

export function ImageUpload({ currentImage, name }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações básicas
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // Limite de 2MB para Base64 (idealmente menor)
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    try {
      setIsUploading(true);

      // Converter para Base64 para demonstração/uso simples
      // Em produção, você faria upload para um serviço de storage aqui
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const result = await updateProfileImage(base64String);
        
        if (result.success) {
          setPreview(base64String);
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);

    } catch {
      toast.error("Erro ao processar imagem.");
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative group">
      <Avatar className="h-32 w-32 border-4 border-red-100 dark:border-red-900/20 transition-all group-hover:opacity-80">
        <AvatarImage src={preview || ""} className="object-cover" />
        <AvatarFallback className="text-4xl font-black text-red-600 bg-red-50 dark:bg-red-950/30">
          {name?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className="absolute bottom-0 right-0 p-2 bg-red-600 rounded-full text-white shadow-lg hover:bg-red-700 transition-colors disabled:bg-neutral-400"
        title="Trocar foto"
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Camera className="h-5 w-5" />
        )}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
