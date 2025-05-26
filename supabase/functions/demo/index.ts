// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
console.info("server started");
Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    // Ensure the request method is POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Method Not Allowed",
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    // Parse the incoming request body
    const user = await req.json();
    console.log(">>> USER: ", user);
    // Validate required fields
    if (!user.first_name || !user.last_name || !user.email) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: first_name, last_name, email",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    // Create Supabase client
    // Note: Make sure to set SUPABASE_URL and SUPABASE_ANON_KEY in your Supabase environment
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    // Insert user into the users table
    const { data, error } = await supabase.from("users").insert(user).select();
    // Handle potential insertion errors
    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    // Return successful response
    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user: data,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (catchError) {
    // Handle any unexpected errors
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: catchError.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
