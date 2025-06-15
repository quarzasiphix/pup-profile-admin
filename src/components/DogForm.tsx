
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { ThumbnailSelector } from "@/components/ThumbnailSelector";
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
    type: "",
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
  }>>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (dog) {
      setFormData({
        name: dog.name || "",
        type: dog.type || "",
        breed: dog.breed || "",
        age: dog.age || "",
        gender: dog.gender || "",
        short_description: dog.short_description || "",
        long_description: dog.long_description || "",
        weight_kg: dog.weight_kg?.toString() || "",
        birthday: dog.birthday || "",
      });
      setSelectedThumbnail(dog.thumbnail_url || "");
      fetchDogImages(dog.id);
    } else {
      setFormData({
        name: "",
        type: "",
        breed: "",
        age: "",
        gender: "",
        short_description: "",
        long_description: "",
        weight_kg: "",
        birthday: "",
      });
      setImages([]);
      setSelectedThumbnail("");
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
        type: formData.type as "puppy" | "adult_male" | "adult_female",
        breed: formData.breed as "yorkshire_terrier" | "pomeranian",
        age: formData.age as "puppy" | "adult",
        gender: formData.gender as "male" | "female",
        short_description: formData.short_description || null,
        long_description: formData.long_description || null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        birthday: formData.birthday || null,
        thumbnail_url: selectedThumbnail || null,
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
          <DialogTitle>{dog ? "Edytuj Psa" : "Dodaj Nowego Psa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Imię *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="breed">Rasa *</Label>
              <Select value={formData.breed} onValueChange={(value) => handleInputChange("breed", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz rasę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yorkshire_terrier">Yorkshire Terrier</SelectItem>
                  <SelectItem value="pomeranian">Pomeranian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="age">Wiek *</Label>
              <Select value={formData.age} onValueChange={(value) => handleInputChange("age", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz wiek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="puppy">Szczenię</SelectItem>
                  <SelectItem value="adult">Dorosły</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gender">Płeć *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz płeć" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Samiec</SelectItem>
                  <SelectItem value="female">Samica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Typ (legacy) *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz typ psa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="puppy">Szczenię</SelectItem>
                  <SelectItem value="adult_male">Dorosły Samiec</SelectItem>
                  <SelectItem value="adult_female">Dorosła Samica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weight">Waga (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight_kg}
                onChange={(e) => handleInputChange("weight_kg", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="birthday">Data urodzenia</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="short_description">Krótki opis</Label>
            <Textarea
              id="short_description"
              value={formData.short_description}
              onChange={(e) => handleInputChange("short_description", e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="long_description">Długi opis</Label>
            <Textarea
              id="long_description"
              value={formData.long_description}
              onChange={(e) => handleInputChange("long_description", e.target.value)}
              rows={4}
            />
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
              selectedThumbnail={selectedThumbnail}
              onThumbnailChange={setSelectedThumbnail}
            />
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Zapisywanie..." : dog ? "Zaktualizuj Psa" : "Dodaj Psa"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
