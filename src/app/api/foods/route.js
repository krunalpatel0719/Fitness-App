// src/app/api/foods/route.js
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("query");
  if (!searchQuery) {
    return new Response(
      JSON.stringify({ error: "Missing search query parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!process.env.FATSECRET_CLIENT_ID || !process.env.FATSECRET_CLIENT_SECRET) {
    console.error("Missing FATSECRET environment variables");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const tokenParams = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.FATSECRET_CLIENT_ID,
      client_secret: process.env.FATSECRET_CLIENT_SECRET,
      scope: "basic premier"  // Use space-delimited scopes, not comma-delimited.
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

    
    const page = searchParams.get("page") || 1;

    // Update the foods.search API call
    apiUrl.searchParams.set("method", "foods.search");
    apiUrl.searchParams.set("search_expression", searchQuery);
    apiUrl.searchParams.set("page_number", page); // Add this line
    apiUrl.searchParams.set("max_results", "10");
    
    
    apiUrl.searchParams.set("search_expression", searchQuery);
    apiUrl.searchParams.set("format", "json");
    apiUrl.searchParams.set("max_results", "10");

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
    return new Response(JSON.stringify(foodData), {
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
