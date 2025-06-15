
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
import { Heart, Baby, Calendar, Weight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

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
    weight_kg: "",
    birthday: "",
  });
  const [images, setImages] = useState<Array<{
    id: string;
    image_url: string;
    image_name: string | null;
    sort_order: number | null;
    is_thumbnail: boolean;
  }>>([]);
  const [loading, setLoading] = useState(false);
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
        weight_kg: dog.weight_kg?.toString() || "",
        birthday: dog.birthday || "",
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
        weight_kg: "",
        birthday: "",
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dogData = {
        name: formData.name,
        breed: formData.breed as "yorkshire_terrier" | "pomeranian",
        age: formData.age as "puppy" | "adult",
        gender: formData.gender as "male" | "female",
        short_description: formData.short_description || null,
        long_description: formData.long_description || null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        birthday: formData.birthday || null,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {dog ? "🐕 Edytuj Psa" : "🐶 Dodaj Nowego Psa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-lg font-semibold">Imię psiaka 🏷️</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="mt-2 text-lg h-12"
                placeholder="Podaj imię..."
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-lg font-semibold mb-4 block">Rasa 🐕</Label>
              <ToggleGroup 
                type="single" 
                value={formData.breed} 
                onValueChange={(value) => value && handleInputChange("breed", value)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <ToggleGroupItem 
                  value="yorkshire_terrier" 
                  className="h-16 text-lg font-semibold data-[state=on]:bg-amber-100 data-[state=on]:text-amber-800 data-[state=on]:border-amber-300 border-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🐕</span>
                    <span>Yorkshire Terrier</span>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="pomeranian"
                  className="h-16 text-lg font-semibold data-[state=on]:bg-orange-100 data-[state=on]:text-orange-800 data-[state=on]:border-orange-300 border-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🦮</span>
                    <span>Pomeranian</span>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div>
              <Label className="text-lg font-semibold mb-4 block">Wiek 📅</Label>
              <RadioGroup 
                value={formData.age} 
                onValueChange={(value) => handleInputChange("age", value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-blue-50 has-[:checked]:bg-blue-100 has-[:checked]:border-blue-300">
                  <RadioGroupItem value="puppy" id="puppy" className="w-5 h-5" />
                  <Label htmlFor="puppy" className="flex items-center gap-2 text-lg font-medium cursor-pointer flex-1">
                    <Baby className="h-5 w-5 text-blue-600" />
                    Szczenię
                    <Badge className="bg-blue-100 text-blue-800 ml-auto">Młode</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-green-50 has-[:checked]:bg-green-100 has-[:checked]:border-green-300">
                  <RadioGroupItem value="adult" id="adult" className="w-5 h-5" />
                  <Label htmlFor="adult" className="flex items-center gap-2 text-lg font-medium cursor-pointer flex-1">
                    <Heart className="h-5 w-5 text-green-600" />
                    Dorosły
                    <Badge className="bg-green-100 text-green-800 ml-auto">Dojrzały</Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-lg font-semibold mb-4 block">Płeć 🚻</Label>
              <RadioGroup 
                value={formData.gender} 
                onValueChange={(value) => handleInputChange("gender", value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-indigo-50 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-300">
                  <RadioGroupItem value="male" id="male" className="w-5 h-5" />
                  <Label htmlFor="male" className="flex items-center gap-2 text-lg font-medium cursor-pointer flex-1">
                    <span className="text-2xl">♂️</span>
                    Samiec
                    <Badge className="bg-indigo-100 text-indigo-800 ml-auto">Chłopiec</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-pink-50 has-[:checked]:bg-pink-100 has-[:checked]:border-pink-300">
                  <RadioGroupItem value="female" id="female" className="w-5 h-5" />
                  <Label htmlFor="female" className="flex items-center gap-2 text-lg font-medium cursor-pointer flex-1">
                    <span className="text-2xl">♀️</span>
                    Samica
                    <Badge className="bg-pink-100 text-pink-800 ml-auto">Dziewczynka</Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="weight" className="text-lg font-semibold flex items-center gap-2">
                <Weight className="h-5 w-5" />
                Waga (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight_kg}
                onChange={(e) => handleInputChange("weight_kg", e.target.value)}
                className="mt-2 text-lg h-12"
                placeholder="np. 2.5"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="birthday" className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Data urodzenia 🎂
              </Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
                className="mt-2 text-lg h-12"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="short_description" className="text-lg font-semibold">Krótki opis 📝</Label>
              <Textarea
                id="short_description"
                value={formData.short_description}
                onChange={(e) => handleInputChange("short_description", e.target.value)}
                rows={3}
                className="mt-2 text-lg"
                placeholder="Napisz krótki opis psiaka..."
              />
            </div>

            <div>
              <Label htmlFor="long_description" className="text-lg font-semibold">Długi opis 📖</Label>
              <Textarea
                id="long_description"
                value={formData.long_description}
                onChange={(e) => handleInputChange("long_description", e.target.value)}
                rows={5}
                className="mt-2 text-lg"
                placeholder="Napisz szczegółowy opis psiaka..."
              />
            </div>
          </div>

          <ImageUpload
            dogId={dog?.id}
            images={images}
            onImagesChange={setImages}
            maxImages={5}
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

          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={loading} className="flex-1 h-14 text-lg font-semibold">
              {loading ? "Zapisywanie... ⏳" : dog ? "💾 Zaktualizuj Psa" : "✨ Dodaj Psa"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-14 px-8 text-lg">
              ❌ Anuluj
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
