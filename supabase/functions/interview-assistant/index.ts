
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
    const { sessionId, prompt, category, generateAudio = true, voiceAnalysis = false, voiceData = null } = await req.json();

    console.log(`Processing interview request for session ${sessionId}`);
    console.log(`Category: ${category}`);
    console.log(`Prompt: ${prompt.substring(0, 100)}...`);
    console.log(`Generate Audio: ${generateAudio}`);
    console.log(`Voice Analysis: ${voiceAnalysis}`);
    
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
      case "Technical":
        systemPrompt += "Focus on core computer science concepts, algorithms, data structures, and problem-solving skills.";
        break;
      case "HR":
        systemPrompt += "Focus on company fit, career goals, salary expectations, and general qualifications.";
        break;
      case "Case Study":
        systemPrompt += "Focus on analytical thinking, problem decomposition, and business strategy.";
        break;
      case "Coding":
        systemPrompt += "Focus on programming skills, code architecture, algorithms, and debugging abilities.";
        break;
      case "Managerial":
        systemPrompt += "Focus on leadership skills, conflict resolution, team management, and strategic thinking.";
        break;
      case "Data Science":
        systemPrompt += "Focus on statistical analysis, machine learning, data visualization, and predictive modeling techniques.";
        break;
      default:
        systemPrompt += `Focus on ${category} concepts and best practices.`;
    }
    
    if (voiceAnalysis) {
      systemPrompt += " When analyzing the voice response, evaluate tone, fluency, confidence, and clarity. Provide detailed feedback on communication skills.";
    } else {
      systemPrompt += " Provide realistic interview questions and detailed, constructive feedback on answers.";
    }

    console.log(`Using API key: ${openAIApiKey.substring(0, 5)}...`);
    console.log(`System prompt: ${systemPrompt}`);

    // If we're analyzing voice data, include that in the prompt
    let enhancedPrompt = prompt;
    if (voiceAnalysis && voiceData) {
      enhancedPrompt += `\n\nAdditionally, analyze the following aspects of the candidate's voice response:
      - Confidence level: Did they sound confident or hesitant?
      - Fluency: Was the speech smooth or filled with many pauses/filler words?
      - Clarity: How well articulated and structured was the response?
      - Tone: Was the tone professional, enthusiastic, nervous, etc.?
      
      The transcribed response is: "${voiceData}"
      
      Include this voice analysis in your feedback.`;
    }

    // Call OpenAI API with streaming disabled for easier response handling
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
          { role: 'user', content: enhancedPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', JSON.stringify(errorData));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('Error in OpenAI response:', data.error);
      throw new Error(data.error.message || "Error from OpenAI API");
    }
    
    const aiResponse = data.choices[0].message.content;
    let audioContent = null;
    let speechConfidence = null;
    let speechFluency = null;
    let speechClarity = null;
    
    // Generate speech from text if requested
    if (generateAudio) {
      try {
        console.log("Generating audio from text...");
        const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: 'nova',
            input: aiResponse,
            response_format: 'mp3',
          }),
        });

        if (!speechResponse.ok) {
          const speechErrorData = await speechResponse.json();
          console.error('OpenAI Speech API error:', JSON.stringify(speechErrorData));
          throw new Error(speechErrorData.error?.message || `OpenAI Speech API error: ${speechResponse.status}`);
        }

        // Convert audio buffer to base64
        const audioBuffer = await speechResponse.arrayBuffer();
        audioContent = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        console.log("Audio generation successful");
      } catch (speechError) {
        console.error('Error generating speech:', speechError);
        // Continue without audio if speech generation fails
      }
    }
    
    // If we did voice analysis, extract metrics from the response
    if (voiceAnalysis) {
      try {
        // Try to find confidence score in the AI response
        const confidenceMatch = aiResponse.match(/confidence.+?(\d+)/i);
        if (confidenceMatch) {
          speechConfidence = parseInt(confidenceMatch[1]);
        }
        
        // Try to find fluency score in the AI response
        const fluencyMatch = aiResponse.match(/fluency.+?(\d+)/i);
        if (fluencyMatch) {
          speechFluency = parseInt(fluencyMatch[1]);
        }
        
        // Try to find clarity score in the AI response
        const clarityMatch = aiResponse.match(/clarity.+?(\d+)/i);
        if (clarityMatch) {
          speechClarity = parseInt(clarityMatch[1]);
        }
      } catch (analysisError) {
        console.error('Error parsing voice analysis metrics:', analysisError);
      }
    }
    
    console.log(`Session ID: ${sessionId} - Processed interview response for category: ${category}`);
    console.log(`Response preview: ${aiResponse.substring(0, 100)}...`);

    // Return the AI response, audio content, and voice metrics if analyzed
    return new Response(JSON.stringify({ 
      aiResponse, 
      audioContent,
      voiceMetrics: voiceAnalysis ? {
        confidence: speechConfidence,
        fluency: speechFluency,
        clarity: speechClarity
      } : null
    }), {
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
