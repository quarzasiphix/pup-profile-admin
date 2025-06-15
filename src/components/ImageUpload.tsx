
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image } from "lucide-react";

interface ImageUploadProps {
  dogId?: string;
  images: Array<{
    id: string;
    image_url: string;
    image_name: string | null;
    sort_order: number | null;
    is_thumbnail: boolean;
  }>;
  onImagesChange: (images: Array<{
    id: string;
    image_url: string;
    image_name: string | null;
    sort_order: number | null;
    is_thumbnail: boolean;
  }>) => void;
  maxImages?: number;
}

export const ImageUpload = ({ 
  dogId, 
  images, 
  onImagesChange, 
  maxImages = 5 
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const optimizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height)
        const maxSize = 1200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (file: File): Promise<string> => {
    const optimizedFile = await optimizeImage(file);
    const fileExt = 'jpg';
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `dog-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('dog-images')
      .upload(filePath, optimizedFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('dog-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Za dużo zdjęć",
        description: `Możesz dodać maksymalnie ${remainingSlots} więcej zdjęć`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const newImages = [];
      
      for (const file of files) {
        const imageUrl = await uploadImage(file);
        
        if (dogId) {
          // Save to database if dog exists
          const { data: imageData, error } = await supabase
            .from("dog_images")
            .insert({
              dog_id: dogId,
              image_url: imageUrl,
              image_name: file.name,
              original_name: file.name,
              file_size: file.size,
              is_thumbnail: images.length === 0 && newImages.length === 0, // First image becomes thumbnail
            })
            .select()
            .single();

          if (error) throw error;
          if (imageData) {
            newImages.push(imageData);
          }
        } else {
          // Temporary storage for new dogs
          newImages.push({
            id: `temp-${Date.now()}-${Math.random()}`,
            image_url: imageUrl,
            image_name: file.name,
            sort_order: images.length + newImages.length,
            is_thumbnail: images.length === 0 && newImages.length === 0, // First image becomes thumbnail
          });
        }
      }
      
      onImagesChange([...images, ...newImages]);
      
      toast({
        title: "Sukces",
        description: `Dodano ${files.length} zdjęć`,
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się przesłać zdjęć",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (imageId: string, imageUrl: string) => {
    try {
      if (dogId && !imageId.startsWith('temp-')) {
        const { error } = await supabase
          .from("dog_images")
          .delete()
          .eq("id", imageId);

        if (error) throw error;
      }

      // Remove from storage
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage
        .from('dog-images')
        .remove([`dog-images/${fileName}`]);

      onImagesChange(images.filter(img => img.id !== imageId));
      
      toast({
        title: "Sukces",
        description: "Zdjęcie zostało usunięte",
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć zdjęcia",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Galeria zdjęć ({images.length}/{maxImages})
        </h3>
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Przesyłanie..." : "Dodaj zdjęcia"}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={image.image_url}
                alt={image.image_name || "Zdjęcie psa"}
                className="w-full h-full object-cover"
              />
              {image.is_thumbnail && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Główne
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(image.id, image.image_url)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {images.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Brak zdjęć</p>
          </div>
        )}
      </div>
    </div>
  );
};
