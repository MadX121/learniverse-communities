
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Use the hardcoded API key since there's no .env file support
const openAIApiKey = "sk-r07Ugps1JYCbcCk5V6OV4HsY2qlHYoh3K2VmPFRo6XT3BlbkFJMpXXC7B9mYqiQd14Teacc0fr95E2pfYj8455toqAoA";

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
    const { audioBase64 } = await req.json();

    if (!audioBase64) {
      throw new Error("Missing audio data");
    }

    console.log(`Using API key: ${openAIApiKey.substring(0, 5)}...`);
    console.log("Audio data received, processing...");

    // Convert base64 to binary
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob and FormData
    const blob = new Blob([bytes], { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    console.log("Calling OpenAI Whisper API to transcribe audio...");

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Whisper API error:', JSON.stringify(errorData));
      throw new Error(errorData.error?.message || `Whisper API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log("Transcription successful:", data);

    return new Response(JSON.stringify({ transcription: data.text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in whisper-transcribe function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
