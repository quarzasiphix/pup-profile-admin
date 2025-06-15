
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
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-start md:space-y-0">
          <CardTitle className="text-lg md:text-xl text-center md:text-left">
            {dog.name}
          </CardTitle>
          <Badge className={`${getTypeColor(dog.type)} text-xs self-center md:self-start`}>
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
          <p className="text-gray-600 text-sm line-clamp-2 text-center md:text-left">
            {dog.short_description}
          </p>
        )}
        
        <div className="flex flex-col space-y-1 md:flex-row md:flex-wrap md:gap-2 md:space-y-0 text-sm text-gray-500">
          {dog.birthday && (
            <div className="flex items-center justify-center md:justify-start gap-1">
              <Calendar className="h-3 w-3" />
              <span className="text-xs md:text-sm">{formatDate(dog.birthday)}</span>
            </div>
          )}
          {dog.weight_kg && (
            <div className="flex items-center justify-center md:justify-start gap-1">
              <Weight className="h-3 w-3" />
              <span className="text-xs md:text-sm">{dog.weight_kg} kg</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2 md:flex-row md:gap-2 md:space-y-0 pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(dog)}
          className="w-full md:flex-1 text-sm"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edytuj
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(dog.id)}
          className="w-full md:flex-1 text-red-600 hover:text-red-700 text-sm"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Usuń
        </Button>
      </CardFooter>
    </Card>
  );
};
