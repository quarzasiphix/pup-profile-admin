
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Weight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Dog = Tables<"dogs">;

interface DogCardProps {
  dog: Dog;
  onEdit: (dog: Dog) => void;
  onDelete: (dogId: string) => void;
}

export const DogCard = ({ dog, onEdit, onDelete }: DogCardProps) => {
  const formatDogType = (type: string) => {
    switch (type) {
      case "puppy":
        return "Szczenię";
      case "adult_male":
        return "Dorosły Samiec";
      case "adult_female":
        return "Dorosła Samica";
      default:
        return type;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Nieznana";
    return new Date(date).toLocaleDateString("pl-PL");
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "puppy":
        return "bg-blue-100 text-blue-800";
      case "adult_male":
        return "bg-green-100 text-green-800";
      case "adult_female":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{dog.name}</CardTitle>
          <Badge className={getTypeColor(dog.type)}>
            {formatDogType(dog.type)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {dog.thumbnail_url && (
          <div className="aspect-video rounded-md overflow-hidden bg-gray-100">
            <img
              src={dog.thumbnail_url}
              alt={dog.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {dog.short_description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {dog.short_description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
          {dog.birthday && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(dog.birthday)}
            </div>
          )}
          {dog.weight_kg && (
            <div className="flex items-center gap-1">
              <Weight className="h-3 w-3" />
              {dog.weight_kg} kg
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(dog)}
          className="flex-1"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edytuj
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(dog.id)}
          className="flex-1 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Usuń
        </Button>
      </CardFooter>
    </Card>
  );
};
