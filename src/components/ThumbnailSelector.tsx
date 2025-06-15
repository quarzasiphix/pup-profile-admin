
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Image } from "lucide-react";

interface ThumbnailSelectorProps {
  images: Array<{
    id: string;
    image_url: string;
    image_name: string | null;
    sort_order: number | null;
    is_thumbnail: boolean;
  }>;
  onThumbnailChange: (imageId: string) => void;
}

export const ThumbnailSelector = ({ images, onThumbnailChange }: ThumbnailSelectorProps) => {
  const selectedThumbnail = images.find(img => img.is_thumbnail);

  return (
    <div className="space-y-3">
      <Label>Wybierz zdjęcie główne</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
              image.is_thumbnail
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onThumbnailChange(image.id)}
          >
            <div className="aspect-square">
              <img
                src={image.image_url}
                alt={image.image_name || "Zdjęcie psa"}
                className="w-full h-full object-cover"
              />
            </div>
            {image.is_thumbnail && (
              <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                <div className="bg-blue-500 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {selectedThumbnail && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onThumbnailChange("")}
          className="text-sm"
        >
          Usuń wybór głównego zdjęcia
        </Button>
      )}
    </div>
  );
};
