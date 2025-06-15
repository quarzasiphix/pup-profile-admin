
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  dogId: string;
}

interface DogImage {
  id: string;
  image_url: string;
  image_name: string | null;
  sort_order: number | null;
  is_thumbnail: boolean;
}

export const ImageGallery = ({ dogId }: ImageGalleryProps) => {
  const [images, setImages] = useState<DogImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, [dogId]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("dog_images")
        .select("*")
        .eq("dog_id", dogId)
        .order("is_thumbnail", { ascending: false })
        .order("sort_order", { ascending: true });

      if (error) throw error;
      
      setImages(data || []);
      
      // Set current index to thumbnail if it exists, otherwise 0
      const thumbnailIndex = data?.findIndex(img => img.is_thumbnail);
      if (thumbnailIndex !== undefined && thumbnailIndex !== -1) {
        setCurrentIndex(thumbnailIndex);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="aspect-video rounded-md bg-gray-100 animate-pulse" />
    );
  }

  if (images.length === 0) {
    return (
      <div className="aspect-video rounded-md bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Brak zdjęć</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="relative">
      <div className="aspect-video rounded-md overflow-hidden bg-gray-100">
        <img
          src={currentImage.image_url}
          alt={currentImage.image_name || "Zdjęcie psa"}
          className="w-full h-full object-cover"
        />
        {currentImage.is_thumbnail && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Główne zdjęcie
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={prevImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={nextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
