
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Pill, DollarSign, Heart, HeartOff } from "lucide-react";
import { medications } from "@/data/medications";
import { toast } from "sonner";

interface MedicationDetailProps {}

const MedicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [medication, setMedication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      // Parse the ID to get category and product index
      const [categoryIndex, productIndex] = id.split('-').map(Number);
      
      if (!isNaN(categoryIndex) && !isNaN(productIndex) && 
          medications[categoryIndex] && 
          medications[categoryIndex].products[productIndex]) {
        const category = medications[categoryIndex];
        const product = category.products[productIndex];
        
        setMedication({
          ...product,
          category: category.category,
          id
        });
        
        // Check if this medication is in favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.some((fav: any) => fav.id === id));
      }
    }
    setLoading(false);
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((fav: any) => fav.id !== id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      // Add to favorites
      favorites.push(medication);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success("Added to favorites");
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <p>Loading medication details...</p>
      </div>
    );
  }

  if (!medication) {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <p>Medication not found.</p>
        <Link to="/">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <div className="container px-4 py-8 mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-primary">{medication.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleFavorite}
                    className={isFavorite ? "text-red-500" : "text-gray-400"}
                  >
                    {isFavorite ? <Heart className="h-5 w-5 fill-current" /> : <Heart className="h-5 w-5" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-primary/10 text-primary border-0">
                    {medication.category}
                  </Badge>
                  <Badge variant="outline">
                    {medication.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <p className="text-gray-700">{medication.details}</p>
                </div>

                {medication.dosage && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold">Dosage</h3>
                      <p className="text-gray-700">{medication.dosage}</p>
                    </div>
                  </div>
                )}

                {medication.benefits && medication.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {medication.benefits.map((benefit: string, index: number) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold">Price</h3>
                    <p className="text-gray-700">{medication.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Similar Medications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {medications
                  .find(cat => cat.category === medication.category)
                  ?.products
                  .filter(product => product.name !== medication.name)
                  .slice(0, 3)
                  .map((product, index) => {
                    // Find this product's ID
                    const catIndex = medications.findIndex(cat => cat.category === medication.category);
                    const prodIndex = medications[catIndex].products.findIndex(p => p.name === product.name);
                    const productId = `${catIndex}-${prodIndex}`;
                    
                    return (
                      <Link to={`/medication/${productId}`} key={index}>
                        <div className="p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                          <h3 className="font-medium text-primary">{product.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{product.type}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {product.price}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-card/90 border-0 shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start">
                  <Pill className="mr-2 h-4 w-4" /> Find Nearby Pharmacies
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Check Medication Interactions
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Calculate Dosage
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationDetail;
