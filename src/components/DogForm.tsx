
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
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
    short_description: "",
    long_description: "",
    weight_kg: "",
    birthday: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (dog) {
      setFormData({
        name: dog.name || "",
        type: dog.type || "",
        short_description: dog.short_description || "",
        long_description: dog.long_description || "",
        weight_kg: dog.weight_kg?.toString() || "",
        birthday: dog.birthday || "",
      });
    } else {
      setFormData({
        name: "",
        type: "",
        short_description: "",
        long_description: "",
        weight_kg: "",
        birthday: "",
      });
    }
    setThumbnailFile(null);
  }, [dog, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('dog-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('dog-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnailUrl = dog?.thumbnail_url || null;

      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(thumbnailFile);
      }

      const dogData = {
        name: formData.name,
        type: formData.type as "puppy" | "adult_male" | "adult_female",
        short_description: formData.short_description || null,
        long_description: formData.long_description || null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        birthday: formData.birthday || null,
        thumbnail_url: thumbnailUrl,
      };

      if (dog) {
        const { error } = await supabase
          .from("dogs")
          .update(dogData)
          .eq("id", dog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("dogs")
          .insert([dogData]);
        if (error) throw error;
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dog ? "Edytuj Psa" : "Dodaj Nowego Psa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="type">Typ *</Label>
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

            <div>
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
            <Label htmlFor="thumbnail">Zdjęcie miniaturowe</Label>
            <div className="mt-1">
              <input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("thumbnail")?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {thumbnailFile ? thumbnailFile.name : "Wybierz zdjęcie miniaturowe"}
              </Button>
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
