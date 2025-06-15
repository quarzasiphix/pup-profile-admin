import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, PawPrint } from "lucide-react";
import { DogCard } from "@/components/DogCard";
import { PuppyCard } from "@/components/PuppyCard";
import { DogForm } from "@/components/DogForm";
import { PuppyForm } from "@/components/PuppyForm";
import { AuthPage } from "@/pages/AuthPage";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Dog = Tables<"dogs">;

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPuppyFormOpen, setIsPuppyFormOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [editingPuppy, setEditingPuppy] = useState<any | null>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const [view, setView] = useState<'dogs'|'puppies'>('dogs');

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

  const { data: puppies = [], isLoading: loadingPuppies, refetch: refetchPuppies } = useQuery({
    queryKey: ['puppies'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('puppies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && view === 'puppies',
  });

  const handleAddDog = () => {
    setEditingDog(null);
    setIsFormOpen(true);
  };

  const handleAddPuppy = () => {
    setEditingPuppy(null);
    setIsPuppyFormOpen(true);
  };

  const handleEditDog = (dog: Dog) => {
    setEditingDog(dog);
    setIsFormOpen(true);
  };

  const handleEditPuppy = (puppy: any) => {
    setEditingPuppy(puppy);
    setIsPuppyFormOpen(true);
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

  const handleDeletePuppy = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('puppies')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Sukces', description: 'Szczenię usunięte' });
      refetchPuppies();
    } catch {
      toast({ title: 'Błąd', description: 'Nie udało się usunąć', variant: 'destructive' });
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
        {/* Toggle view */}
        <div className="flex justify-center mb-6 gap-4">
          <Button variant={view==='dogs'?'default':'outline'} onClick={()=>setView('dogs')}>Psy</Button>
          <Button variant={view==='puppies'?'default':'outline'} onClick={()=>setView('puppies')}>Szczenięta</Button>
        </div>

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
        {view==='dogs' ? (
          isLoading ? (
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
          )
        ) : (
          loadingPuppies ? (
            <div className="text-center">Ładowanie...</div>
          ) : puppies.length === 0 ? (
            <div className="text-center py-16">Brak szczeniąt</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {puppies.map((puppy)=> (
                <PuppyCard key={puppy.id} puppy={puppy} onEdit={handleEditPuppy} onDelete={handleDeletePuppy} />
              ))}
            </div>
          )
        )}

        <DogForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          dog={editingDog}
          onSuccess={handleFormSuccess}
        />

        <PuppyForm open={isPuppyFormOpen} onOpenChange={setIsPuppyFormOpen} puppy={editingPuppy} onSuccess={()=>{setIsPuppyFormOpen(false); setEditingPuppy(null); refetchPuppies();}} />
      </div>

      {/* Sticky Add Button at Bottom */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        {view==='dogs' ? (
          <Button onClick={handleAddDog} size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg md:text-xl font-semibold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105 border-4 border-white">
            <Plus className="h-6 w-6 mr-3" /> Dodaj Nowego Psa
          </Button>
        ) : (
          <Button onClick={handleAddPuppy} size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 text-lg md:text-xl font-semibold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105 border-4 border-white">
            <PawPrint className="h-6 w-6 mr-3" /> Dodaj Szczenię
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
