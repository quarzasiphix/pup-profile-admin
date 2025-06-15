import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DogCard } from "@/components/DogCard";
import { DogForm } from "@/components/DogForm";
import { AuthPage } from "@/pages/AuthPage";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Dog = Tables<"dogs">;

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Check auth status
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-24">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            🐕 Moja Hodowla Psów
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
            Zarządzaj swoimi ukochanymi psami hodowlanymi w jednym miejscu
          </p>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : dogs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6">🐶</div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                Brak psów w hodowli
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Zacznij od dodania swojego pierwszego psa do systemu
              </p>
              <Button 
                onClick={handleAddDog} 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Dodaj Pierwszego Psa
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Dogs Count */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg">
                <div className="text-2xl mr-3">🏠</div>
                <span className="text-lg font-semibold text-gray-700">
                  {dogs.length} {dogs.length === 1 ? 'pies' : dogs.length < 5 ? 'psy' : 'psów'} w hodowli
                </span>
              </div>
            </div>

            {/* Dogs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {dogs.map((dog) => (
                <DogCard
                  key={dog.id}
                  dog={dog}
                  onEdit={handleEditDog}
                  onDelete={handleDeleteDog}
                />
              ))}
            </div>
          </>
        )}

        <DogForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          dog={editingDog}
          onSuccess={handleFormSuccess}
        />
      </div>

      {/* Sticky Add Button at Bottom */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <Button 
          onClick={handleAddDog} 
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg md:text-xl font-semibold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105 border-4 border-white"
        >
          <Plus className="h-6 w-6 mr-3" />
          Dodaj Nowego Psa
        </Button>
      </div>
    </div>
  );
};

export default Index;
