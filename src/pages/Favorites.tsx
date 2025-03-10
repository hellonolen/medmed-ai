
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MedicationCard } from "@/components/MedicationCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(storedFavorites);
  }, []);

  const removeFromFavorites = (id: string) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);
    toast.success("Removed from favorites");
  };

  const clearAllFavorites = () => {
    localStorage.setItem('favorites', JSON.stringify([]));
    setFavorites([]);
    toast.success("All favorites cleared");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
          
          {favorites.length > 0 && (
            <Button variant="destructive" onClick={clearAllFavorites}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear All
            </Button>
          )}
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Your Favorites</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Medications and treatments you've saved for quick reference
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-card/50 rounded-lg">
            <p className="text-gray-500 mb-6">You haven't added any favorites yet.</p>
            <Link to="/">
              <Button>
                Search for Medications
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fadeIn">
            {favorites.map((favorite, index) => (
              <div key={index} className="relative">
                <Link to={`/medication/${favorite.id}`}>
                  <MedicationCard
                    name={favorite.name}
                    details={favorite.details}
                    price={favorite.price}
                  />
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute -right-2 -top-2 z-10 bg-background/80 hover:bg-background text-destructive hover:text-destructive"
                  onClick={() => removeFromFavorites(favorite.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
