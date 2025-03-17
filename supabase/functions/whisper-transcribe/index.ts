
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
    formData.append('response_format', 'verbose_json');

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

    // Extract additional metrics from the verbose response if available
    const segments = data.segments || [];
    
    // Calculate average word speed (words per minute)
    let totalWords = 0;
    let totalDuration = 0;
    
    segments.forEach(segment => {
      // Rough word count by splitting on spaces
      const wordCount = segment.text.trim().split(/\s+/).length;
      totalWords += wordCount;
      totalDuration += segment.end - segment.start;
    });
    
    const wordsPerMinute = totalDuration > 0 ? Math.round((totalWords / totalDuration) * 60) : null;
    
    // Count filler words (um, uh, like, you know, etc.)
    const fillerWordsRegex = /\b(um|uh|like|you know|i mean|so|actually|basically|literally|right)\b/gi;
    const fillerWordsCount = (data.text.match(fillerWordsRegex) || []).length;
    
    // Count pauses (approximated by ellipses, commas, periods in the transcript)
    const pausesCount = (data.text.match(/[,.…]/g) || []).length;

    return new Response(JSON.stringify({ 
      transcription: data.text,
      speechMetrics: {
        wordsPerMinute: wordsPerMinute,
        fillerWords: fillerWordsCount,
        pauses: pausesCount,
        duration: totalDuration
      }
    }), {
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
