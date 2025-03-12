
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, prompt, category } = await req.json();

    // Create system prompt based on interview category
    let systemPrompt = "You are an expert technical interviewer. ";
    
    switch (category) {
      case "Frontend Development":
        systemPrompt += "Focus on React, TypeScript, HTML, CSS, and modern frontend best practices.";
        break;
      case "Backend Development":
        systemPrompt += "Focus on server-side technologies, databases, APIs, and backend architecture.";
        break;
      case "System Design":
        systemPrompt += "Focus on architecture, scalability, reliability, and system design patterns.";
        break;
      case "Behavioral":
        systemPrompt += "Focus on soft skills, teamwork, conflict resolution, and professional growth.";
        break;
      default:
        systemPrompt += `Focus on ${category} concepts and best practices.`;
    }
    
    systemPrompt += " Provide realistic interview questions and detailed feedback on answers.";

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "Error from OpenAI API");
    }
    
    const aiResponse = data.choices[0].message.content;
    
    console.log(`Session ID: ${sessionId} - Processed interview response for category: ${category}`);

    // Return the AI response
    return new Response(JSON.stringify({ aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in interview-assistant function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
