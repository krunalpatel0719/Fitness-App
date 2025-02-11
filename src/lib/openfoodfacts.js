// src/lib/openfoodfacts.js
export async function searchFoodProducts(query) {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page_size=5&json=1`
      );
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      return data.products.map(product => ({
        id: product.id,
        name: product.product_name || 'Unnamed Product',
        brand: product.brands || '',
        calories: product.nutriments?.['energy-kcal_serving'] || product.nutriments?.['energy-kcal'] || 0,
        servingSize: product.serving_size || '100g',
        protein: product.nutriments?.proteins_serving || product.nutriments?.proteins || 0,
        carbs: product.nutriments?.carbohydrates_serving || product.nutriments?.carbohydrates || 0,
        fat: product.nutriments?.fat_serving || product.nutriments?.fat || 0
      }));
    } catch (error) {
      console.error('OpenFoodFacts API error:', error);
      return [];
    }
  }