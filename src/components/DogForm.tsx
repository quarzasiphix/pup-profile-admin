import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { ThumbnailSelector } from "@/components/ThumbnailSelector";
import { Heart, Baby, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";

type Dog = Tables<"dogs">;

interface DogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dog?: Dog | null;
  onSuccess: () => void;
}

export const DogForm = ({ open, onOpenChange, dog, onSuccess }: DogFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    gender: "",
    short_description: "",
    long_description: "",
    is_reproduktor: false,
  });
  const [images, setImages] = useState<Array<{
    id: string;
    image_url: string;
    image_name: string | null;
    sort_order: number | null;
    is_thumbnail: boolean;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (dog) {
      setFormData({
        name: dog.name || "",
        breed: dog.breed || "",
        age: dog.age || "",
        gender: dog.gender || "",
        short_description: dog.short_description || "",
        long_description: dog.long_description || "",
        is_reproduktor: (dog as any).is_reproduktor ?? false,
      });
      fetchDogImages(dog.id);
    } else {
      setFormData({
        name: "",
        breed: "",
        age: "",
        gender: "",
        short_description: "",
        long_description: "",
        is_reproduktor: false,
      });
      setImages([]);
    }
  }, [dog, open]);

  const fetchDogImages = async (dogId: string) => {
    try {
      const { data, error } = await supabase
        .from("dog_images")
        .select("*")
        .eq("dog_id", dogId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching dog images:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation for required enum fields
    if (!formData.breed || !formData.age || !formData.gender) {
      toast({
        title: "Błąd",
        description: "Uzupełnij pola rasa, wiek oraz płeć przed zapisaniem.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const dogData: any = {
        name: formData.name,
        breed: formData.breed as "yorkshire_terrier" | "pomeranian",
        age: formData.age as "puppy" | "adult",
        gender: formData.gender as "male" | "female",
        short_description: formData.short_description || null,
        long_description: formData.long_description || null,
        is_reproduktor: formData.is_reproduktor,
        // Remove thumbnail_url as we now use is_thumbnail in dog_images
        thumbnail_url: null,
        // Set type based on age and gender for backward compatibility
        type: formData.age === "puppy" ? "puppy" as const : 
              formData.gender === "male" ? "adult_male" as const : "adult_female" as const,
      };

      let dogId: string;

      if (dog) {
        // Update existing dog
        const { error } = await supabase
          .from("dogs")
          .update(dogData)
          .eq("id", dog.id);
        if (error) throw error;
        dogId = dog.id;
      } else {
        // Create new dog
        const { data: newDog, error } = await supabase
          .from("dogs")
          .insert([dogData])
          .select()
          .single();
        if (error) throw error;
        dogId = newDog.id;

        // Save temporary images to database
        if (images.length > 0) {
          const imageInserts = images.map((img, index) => ({
            dog_id: dogId,
            image_url: img.image_url,
            image_name: img.image_name,
            original_name: img.image_name,
            sort_order: index,
            is_thumbnail: img.is_thumbnail || false,
          }));

          const { error: imageError } = await supabase
            .from("dog_images")
            .insert(imageInserts);
          
          if (imageError) throw imageError;
        }
      }

      toast({
        title: "Sukces",
        description: `Pies ${dog ? "zaktualizowany" : "dodany"} pomyślnie`,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Błąd",
        description: `Nie udało się ${dog ? "zaktualizować" : "dodać"} psa`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto inset-0 w-screen h-screen max-w-none max-h-none translate-x-0 translate-y-0 rounded-none border-0 p-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[95vw] sm:max-w-4xl sm:h-[95vh] sm:max-h-[95vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:p-6">
        {/* Sticky Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="fixed top-4 right-4 z-50 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl"
          aria-label="Zamknij"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center pr-12">
            {dog ? "🐕 Edytuj Psa" : "🐶 Dodaj Nowego Psa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <Label htmlFor="name" className="text-base sm:text-lg font-semibold">Imię psiaka 🏷️</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="mt-2 text-base sm:text-lg h-10 sm:h-12"
                placeholder="Podaj imię..."
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-base sm:text-lg font-semibold mb-4 block">Rasa 🐕</Label>
              <ToggleGroup 
                type="single" 
                value={formData.breed} 
                onValueChange={(value) => value && handleInputChange("breed", value)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <ToggleGroupItem 
                  value="yorkshire_terrier" 
                  className="h-12 sm:h-16 text-base sm:text-lg font-semibold data-[state=on]:bg-amber-100 data-[state=on]:text-amber-800 data-[state=on]:border-amber-300 border-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl">🐕</span>
                    <span>Yorkshire Terrier</span>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="pomeranian"
                  className="h-12 sm:h-16 text-base sm:text-lg font-semibold data-[state=on]:bg-orange-100 data-[state=on]:text-orange-800 data-[state=on]:border-orange-300 border-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl">🦮</span>
                    <span>Pomeranian</span>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div>
              <Label className="text-base sm:text-lg font-semibold mb-4 block">Wiek 📅</Label>
              <RadioGroup 
                value={formData.age} 
                onValueChange={(value) => handleInputChange("age", value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg border-2 hover:bg-blue-50 has-[:checked]:bg-blue-100 has-[:checked]:border-blue-300">
                  <RadioGroupItem value="puppy" id="puppy" className="w-5 h-5" />
                  <Label htmlFor="puppy" className="flex items-center gap-2 text-base sm:text-lg font-medium cursor-pointer flex-1">
                    <Baby className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Szczenię
                    <Badge className="bg-blue-100 text-blue-800 ml-auto text-xs">Młode</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg border-2 hover:bg-green-50 has-[:checked]:bg-green-100 has-[:checked]:border-green-300">
                  <RadioGroupItem value="adult" id="adult" className="w-5 h-5" />
                  <Label htmlFor="adult" className="flex items-center gap-2 text-base sm:text-lg font-medium cursor-pointer flex-1">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    Dorosły
                    <Badge className="bg-green-100 text-green-800 ml-auto text-xs">Dojrzały</Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base sm:text-lg font-semibold mb-4 block">Płeć 🚻</Label>
              <RadioGroup 
                value={formData.gender} 
                onValueChange={(value) => handleInputChange("gender", value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg border-2 hover:bg-indigo-50 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-300">
                  <RadioGroupItem value="male" id="male" className="w-5 h-5" />
                  <Label htmlFor="male" className="flex items-center gap-2 text-base sm:text-lg font-medium cursor-pointer flex-1">
                    <span className="text-xl sm:text-2xl">♂️</span>
                    Samiec
                    <Badge className="bg-indigo-100 text-indigo-800 ml-auto text-xs">Chłopiec</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg border-2 hover:bg-pink-50 has-[:checked]:bg-pink-100 has-[:checked]:border-pink-300">
                  <RadioGroupItem value="female" id="female" className="w-5 h-5" />
                  <Label htmlFor="female" className="flex items-center gap-2 text-base sm:text-lg font-medium cursor-pointer flex-1">
                    <span className="text-xl sm:text-2xl">♀️</span>
                    Samica
                    <Badge className="bg-pink-100 text-pink-800 ml-auto text-xs">Dziewczynka</Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base sm:text-lg font-semibold mb-4 block">Reproduktor? 🐾</Label>
              <div className="flex items-center gap-4">
                <Switch
                  id="is-repro"
                  checked={formData.is_reproduktor}
                  onCheckedChange={(val) => handleInputChange("is_reproduktor", val)}
                />
                <span className="text-base sm:text-lg">{formData.is_reproduktor ? "Tak" : "Nie"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="short_description" className="text-base sm:text-lg font-semibold">Krótki opis 📝</Label>
              <Textarea
                id="short_description"
                value={formData.short_description}
                onChange={(e) => handleInputChange("short_description", e.target.value)}
                rows={3}
                className="mt-2 text-base sm:text-lg"
                placeholder="Napisz krótki opis psiaka..."
              />
            </div>

            <div>
              <Label htmlFor="long_description" className="text-base sm:text-lg font-semibold">Długi opis 📖</Label>
              <Textarea
                id="long_description"
                value={formData.long_description}
                onChange={(e) => handleInputChange("long_description", e.target.value)}
                rows={5}
                className="mt-2 text-base sm:text-lg"
                placeholder="Napisz szczegółowy opis psiaka..."
              />
            </div>
          </div>

          <ImageUpload
            dogId={dog?.id}
            images={images}
            onImagesChange={setImages}
            maxImages={5}
            onUploadingChange={setImageUploading}
          />

          {images.length > 0 && (
            <ThumbnailSelector
              images={images}
              onThumbnailChange={(imageId) => {
                setImages(prev => prev.map(img => ({
                  ...img,
                  is_thumbnail: img.id === imageId
                })));
              }}
            />
          )}

          <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 bg-background border-t p-4 sm:p-6 flex flex-col sm:flex-row gap-4 z-10">
            <Button type="submit" disabled={loading || imageUploading} className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold">
              {loading ? "Zapisywanie... ⏳" : dog ? "💾 Zaktualizuj Psa" : "✨ Dodaj Psa"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg">
              ❌ Anuluj
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
