
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Weight } from "lucide-react";
import { ImageGallery } from "@/components/ImageGallery";
import type { Tables } from "@/integrations/supabase/types";

type Dog = Tables<"dogs">;

interface DogCardProps {
  dog: Dog;
  onEdit: (dog: Dog) => void;
  onDelete: (dogId: string) => void;
}

export const DogCard = ({ dog, onEdit, onDelete }: DogCardProps) => {
  const formatBreed = (breed: string) => {
    switch (breed) {
      case "yorkshire_terrier":
        return "Yorkshire Terrier";
      case "pomeranian":
        return "Pomeranian";
      default:
        return breed;
    }
  };

  const formatAge = (age: string) => {
    switch (age) {
      case "puppy":
        return "Szczenię";
      case "adult":
        return "Dorosły";
      default:
        return age;
    }
  };

  const formatGender = (gender: string) => {
    switch (gender) {
      case "male":
        return "Samiec";
      case "female":
        return "Samica";
      default:
        return gender;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Nieznana";
    return new Date(date).toLocaleDateString("pl-PL");
  };

  const getAgeColor = (age: string) => {
    switch (age) {
      case "puppy":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "adult":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case "male":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "female":
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0">
      <CardHeader className="pb-4">
        <div className="text-center space-y-3">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {dog.name}
          </CardTitle>
          <div className="flex flex-wrap gap-2 justify-center">
            {dog.breed && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-sm px-3 py-1 font-semibold">
                {formatBreed(dog.breed)}
              </Badge>
            )}
            {dog.age && (
              <Badge className={`${getAgeColor(dog.age)} text-sm px-3 py-1 font-semibold border`}>
                {formatAge(dog.age)}
              </Badge>
            )}
            {dog.gender && (
              <Badge className={`${getGenderColor(dog.gender)} text-sm px-3 py-1 font-semibold border`}>
                {formatGender(dog.gender)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-6">
        <ImageGallery dogId={dog.id} />
        
        {dog.short_description && (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-700 text-base leading-relaxed text-center">
              {dog.short_description}
            </p>
          </div>
        )}
        
        <div className="flex flex-col space-y-3 text-center">
          {dog.birthday && (
            <div className="flex items-center justify-center gap-2 bg-blue-50 rounded-lg p-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-base font-medium text-blue-800">
                Urodzony: {formatDate(dog.birthday)}
              </span>
            </div>
          )}
          {dog.weight_kg && (
            <div className="flex items-center justify-center gap-2 bg-green-50 rounded-lg p-3">
              <Weight className="h-5 w-5 text-green-600" />
              <span className="text-base font-medium text-green-800">
                Waga: {dog.weight_kg} kg
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3 pt-6 px-6">
        <Button
          variant="outline"
          size="lg"
          onClick={() => onEdit(dog)}
          className="w-full text-base font-semibold py-3 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 rounded-xl transition-all duration-200"
        >
          <Edit className="h-5 w-5 mr-2" />
          Edytuj Psa
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => onDelete(dog.id)}
          className="w-full text-base font-semibold py-3 border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 rounded-xl transition-all duration-200"
        >
          <Trash2 className="h-5 w-5 mr-2" />
          Usuń Psa
        </Button>
      </CardFooter>
    </Card>
  );
};
