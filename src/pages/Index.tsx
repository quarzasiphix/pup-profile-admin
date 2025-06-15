
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DogCard } from "@/components/DogCard";
import { DogForm } from "@/components/DogForm";
import { AuthDialog } from "@/components/AuthDialog";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Dog = Tables<"dogs">;

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  // Check auth status
  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (!user) setIsAuthOpen(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) setIsAuthOpen(true);
    });

    return () => subscription.unsubscribe();
  });

  const { data: dogs = [], isLoading, refetch } = useQuery({
    queryKey: ["dogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleAddDog = () => {
    setEditingDog(null);
    setIsFormOpen(true);
  };

  const handleEditDog = (dog: Dog) => {
    setEditingDog(dog);
    setIsFormOpen(true);
  };

  const handleDeleteDog = async (dogId: string) => {
    try {
      const { error } = await supabase
        .from("dogs")
        .update({ is_active: false })
        .eq("id", dogId);

      if (error) throw error;

      toast({
        title: "Sukces",
        description: "Pies został usunięty pomyślnie",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć psa",
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingDog(null);
    refetch();
  };

  if (!user) {
    return <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="text-center md:text-left mb-4">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
              System Zarządzania Hodowlą Psów
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Zarządzaj swoimi psami hodowlanymi i ich informacjami
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <Button 
              onClick={handleAddDog} 
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm md:text-base">Dodaj Nowego Psa</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-80 md:h-96 animate-pulse" />
            ))}
          </div>
        ) : dogs.length === 0 ? (
          <div className="text-center py-12 px-4">
            <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
              Nie dodano jeszcze żadnych psów
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Zacznij od dodania swojego pierwszego psa do systemu
            </p>
            <Button onClick={handleAddDog} className="w-full md:w-auto">
              Dodaj Swojego Pierwszego Psa
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {dogs.map((dog) => (
              <DogCard
                key={dog.id}
                dog={dog}
                onEdit={handleEditDog}
                onDelete={handleDeleteDog}
              />
            ))}
          </div>
        )}

        <DogForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          dog={editingDog}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  );
};

export default Index;
