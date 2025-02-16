// src/app/api/foods/route.js



  export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("query");
    const foodId = searchParams.get("id");
    const page = parseInt(searchParams.get("page")) || 1;
    
    if (!process.env.FATSECRET_CLIENT_ID || !process.env.FATSECRET_CLIENT_SECRET) {
      console.error("Missing FATSECRET environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  
    // Handle food by ID lookup
    if (foodId) {
      try {
        // Get access token (same as before)
        const tokenParams = new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.FATSECRET_CLIENT_ID,
          client_secret: process.env.FATSECRET_CLIENT_SECRET,
          scope: "premier"
        });
  
        const tokenResponse = await fetch("https://oauth.fatsecret.com/connect/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: tokenParams
        });
  
        if (!tokenResponse.ok) throw new Error("Token error");
        const tokenData = await tokenResponse.json();
        
        // Call food.get.v2 method
        const apiUrl = new URL("https://platform.fatsecret.com/rest/server.api");
        apiUrl.searchParams.set("method", "food.get.v4");
        apiUrl.searchParams.set("food_id", foodId);
        apiUrl.searchParams.set("format", "json");
  
        const apiResponse = await fetch(apiUrl.toString(), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json"
          }
        });
  
        if (!apiResponse.ok) throw new Error("API error");
        const foodData = await apiResponse.json();
  
        // Format response
        const formattedFood = {
          food_id: foodData.food.food_id,
          food_name: foodData.food.food_name,
          brand_name: foodData.food.brand_name,
          servings: foodData.food.servings.serving.map(serving => ({
            serving_id: serving.serving_id,
            description: serving.serving_description,
            calories: Number(serving.calories),
            protein: Number(serving.protein),
            carbs: Number(serving.carbohydrate),
            fat: Number(serving.fat),
            metric_serving_amount: serving.metric_serving_amount,
            metric_serving_unit: serving.metric_serving_unit,
            default: serving.is_default === "1"
          }))
        };
  
        return new Response(JSON.stringify({ food: formattedFood }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
  
      } catch (error) {
        console.error("Food by ID error:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch food" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

  // if (!searchQuery) {
  //   return new Response(
  //     JSON.stringify({ error: "Missing search query parameter" }),
  //     { status: 400, headers: { "Content-Type": "application/json" } }
  //   );
  // }

  if (searchQuery) {
  try {
    const tokenParams = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.FATSECRET_CLIENT_ID,
      client_secret: process.env.FATSECRET_CLIENT_SECRET,
      scope: "premier"  // Use space-delimited scopes, not comma-delimited.
    });

    const tokenResponse = await fetch("https://oauth.fatsecret.com/connect/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams
    });

    if (!tokenResponse.ok) {
      console.error("Error obtaining token", await tokenResponse.text());
      return new Response(
        JSON.stringify({ error: "Failed to obtain access token" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "No access token received" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build URL for foods.search using method-based integration


    const apiUrl = new URL("https://platform.fatsecret.com/rest/server.api");

    
   

    // Update the foods.search API call
    // apiUrl.searchParams.set("method", "foods.search");
    // apiUrl.searchParams.set("search_expression", searchQuery);
    // apiUrl.searchParams.set("page_number", page); // Add this line
    // apiUrl.searchParams.set("max_results", "10");
    
    
    // apiUrl.searchParams.set("search_expression", searchQuery);
    // apiUrl.searchParams.set("format", "json");
    // apiUrl.searchParams.set("max_results", "10");

   
    
    // V3 parameters
    apiUrl.searchParams.set("method", "foods.search.v3");
    apiUrl.searchParams.set("search_expression", searchQuery);
    apiUrl.searchParams.set("page_number", Math.max(0, page - 1)); // Zero-based
    apiUrl.searchParams.set("max_results", "10");
    apiUrl.searchParams.set("format", "json");
    apiUrl.searchParams.set("flag_default_serving", "true");
    apiUrl.searchParams.set("include_sub_categories", "false");
    apiUrl.searchParams.set("region", "US");
    apiUrl.searchParams.set("language", "en");


    // Use POST for the request
    const apiResponse = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!apiResponse.ok) {
      const apiErrorText = await apiResponse.text();
      console.error("Error calling FatSecret API", apiErrorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch food data" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const foodData = await apiResponse.json();
    console.log("Raw foodData:", foodData);

    const formattedResponse = {
      foods: {
        food: foodData.foods_search.results.food?.map(item => ({
          food_id: item.food_id,
          food_name: item.food_name,
          brand_name: item.brand_name,
          food_type: item.food_type,
          servings: item.servings.serving.map(serving => ({
            serving_id: serving.serving_id,
            description: serving.serving_description,
            calories: serving.calories,
            protein: serving.protein,
            carbs: serving.carbohydrate,
            fat: serving.fat,
            saturated_fat: serving.saturated_fat,
            polyunsaturated_fat: serving.polyunsaturated_fat,
            monounsaturated_fat: serving.monounsaturated_fat,
            trans_fat: serving.trans_fat,
            cholesterol: serving.cholesterol,
            sodium: serving.sodium,
            potassium: serving.potassium,
            fiber: serving.fiber,
            sugar: serving.sugar,
            added_sugar: serving.added_sugar,
            vitamin_d: serving.vitamin_d,
            calcium: serving.calcium,
            iron: serving.iron,
            vitamin_a: serving.vitamin_a,
            vitamin_c: serving.vitamin_c,
            iron: serving.iron,
            metric_serving_amount: serving.metric_serving_amount,
            metric_serving_unit: serving.metric_serving_unit,
            number_of_units: serving.number_of_units,
            measurement_description: serving.measurement_description,
            default: serving.is_default === "1"
          }))
        })) || [],
        page_number: parseInt(foodData.foods_search.page_number) + 1, // Convert to 1-based
        total_results: parseInt(foodData.foods_search.total_results),
        total_pages: Math.ceil(parseInt(foodData.foods_search.total_results) / parseInt(foodData.foods_search.max_results))
      }
    };
    
    return new Response(JSON.stringify(formattedResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

   
  } catch (error) {
    console.error("API route error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
  }