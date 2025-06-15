
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
        title: "Success",
        description: "Dog removed successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove dog",
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dog Breeding CMS</h1>
            <p className="text-gray-600 mt-2">Manage your breeding dogs and their information</p>
          </div>
          <Button onClick={handleAddDog} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Dog
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-96 animate-pulse" />
            ))}
          </div>
        ) : dogs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No dogs added yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first dog to the system</p>
            <Button onClick={handleAddDog}>Add Your First Dog</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
