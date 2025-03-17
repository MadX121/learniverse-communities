
import { useEffect, useState, useRef, Fragment } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import VoiceIndicator from "@/components/VoiceIndicator";
import SpeechMetricsCard from "@/components/SpeechMetricsCard";
import { 
  Mic, MicOff, Loader2, ArrowLeft, MessageSquare, Zap, 
  Award, Brain, BarChart3, VolumeX, Volume2, CirclePause, 
  CirclePlay, BadgeCheck, Headphones 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define types for our interview session
interface InterviewSession {
  id: string;
  category: string;
  completed: boolean;
  score: number | null;
  feedback: string | null;
  created_at: string;
  completed_at: string | null;
}

interface Question {
  id: string;
  text: string;
  audioContent?: string;
  response?: string;
  speechMetrics?: {
    wordsPerMinute?: number;
    fillerWords?: number;
    pauses?: number;
    duration?: number;
    confidence?: number;
    fluency?: number;
    clarity?: number;
  };
  evaluation?: {
    relevance: number;
    clarity: number;
    confidence: number;
    overall: number;
    feedback: string;
  };
}

const InterviewSession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Session state
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Recording state
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [processingResponse, setProcessingResponse] = useState(false);
  const [transcription, setTranscription] = useState("");
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  
  // Voice UI state
  const [voiceMode, setVoiceMode] = useState<'listening' | 'speaking' | 'processing' | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [autoListen, setAutoListen] = useState(true);
  
  // Media recorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Auto-scroll ref
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch session data on mount
  useEffect(() => {
    if (sessionId && user) {
      fetchSessionData();
    }
  }, [sessionId, user]);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [questions, transcription]);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    audioRef.current.addEventListener('play', () => {
      setIsPlaying(true);
      setIsAiSpeaking(true);
      setVoiceMode('speaking');
    });
    
    audioRef.current.addEventListener('pause', () => {
      setIsPlaying(false);
      setIsAiSpeaking(false);
      setVoiceMode(null);
    });
    
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      setIsAiSpeaking(false);
      setVoiceMode(null);
      
      // Auto-start listening for user response after AI finishes speaking
      if (autoListen && !questions[currentQuestionIndex]?.response) {
        setTimeout(() => {
          startRecording();
        }, 1000);
      }
    });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('play', () => setIsPlaying(true));
        audioRef.current.removeEventListener('pause', () => setIsPlaying(false));
        audioRef.current.removeEventListener('ended', () => {
          setIsPlaying(false);
          setIsAiSpeaking(false);
        });
      }
    };
  }, [autoListen, currentQuestionIndex, questions]);
  
  // Set up audio URL when audioContent changes
  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion?.audioContent && !audioUrl) {
      const base64Audio = currentQuestion.audioContent;
      const audioBlob = base64ToBlob(base64Audio, 'audio/mp3');
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Auto-play the audio when it's first loaded
      if (audioRef.current && !muted && autoPlay) {
        audioRef.current.src = url;
        audioRef.current.onloadedmetadata = () => {
          playAudio();
        };
      }
    }
    
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [questions, currentQuestionIndex, autoPlay, muted]);
  
  // Function to fetch session data
  const fetchSessionData = async () => {
    try {
      setLoading(true);
      
      // Fetch interview session
      const { data: sessionData, error: sessionError } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      
      if (sessionError) throw sessionError;
      if (!sessionData) throw new Error("Session not found");
      
      setSession(sessionData);
      
      // If this is a new session, generate the first question
      if (!sessionData.completed) {
        generateInitialQuestion(sessionData.category);
      }
      
    } catch (error) {
      console.error("Error fetching session data:", error);
      toast({
        title: "Error",
        description: "Failed to load interview session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Generate initial question based on category
  const generateInitialQuestion = async (category: string) => {
    try {
      toast({
        title: "Preparing your interview",
        description: "The AI is preparing your first question...",
      });
      
      // Call our edge function to get a question with audio
      const response = await supabase.functions.invoke("interview-assistant", {
        body: {
          sessionId,
          prompt: `You are conducting a ${category} interview. Provide a challenging first question that would be asked in this type of interview. Make it sound like a real interviewer is asking the question. Keep your question concise and direct.`,
          category,
          generateAudio: true
        }
      });
      
      // Check if the response was successful
      if (response.error) {
        throw new Error(response.error.message || "Failed to generate question");
      }

      if (response.data) {
        setQuestions([{
          id: `q-${Date.now()}`,
          text: response.data.aiResponse,
          audioContent: response.data.audioContent
        }]);
        
        toast({
          title: "Interview ready",
          description: "Your first question is ready. The interviewer will speak to you.",
        });
      } else {
        throw new Error("Failed to generate question: No response data");
      }
    } catch (error) {
      console.error("Error generating question:", error);
      toast({
        title: "Error",
        description: "Failed to generate interview question. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Function to convert base64 to blob
  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: mimeType });
  };
  
  // Play audio
  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsAiSpeaking(true);
        })
        .catch(err => {
          console.error("Error playing audio:", err);
          toast({
            title: "Error",
            description: "Failed to play audio. Please check your audio settings.",
            variant: "destructive"
          });
        });
    }
  };
  
  // Pause audio
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsAiSpeaking(false);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    setMuted(!muted);
    if (audioRef.current) {
      audioRef.current.muted = !muted;
    }
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset audio chunks
      audioChunksRef.current = [];
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        processRecording(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setRecording(true);
      setVoiceMode('listening');
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone to answer the question.",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setVoiceMode('processing');
      
      toast({
        title: "Recording stopped",
        description: "Processing your response...",
      });
    }
  };
  
  // Process the recording
  const processRecording = async (blob: Blob) => {
    try {
      setProcessingResponse(true);
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64Data = reader.result?.toString();
        const base64Audio = base64Data ? base64Data.split(',')[1] : null;
        
        if (!base64Audio) {
          throw new Error("Failed to convert audio to base64");
        }
        
        // First, transcribe the audio using Whisper API via an edge function
        const transcribeResponse = await supabase.functions.invoke("whisper-transcribe", {
          body: { audioBase64: base64Audio }
        });

        // Check if the response was successful
        if (transcribeResponse.error) {
          throw new Error(transcribeResponse.error.message || "Failed to transcribe audio");
        }

        if (!transcribeResponse.data || !transcribeResponse.data.transcription) {
          throw new Error("No transcription data received");
        }

        const transcribedText = transcribeResponse.data.transcription;
        const speechMetrics = transcribeResponse.data.speechMetrics || {};
        setTranscription(transcribedText);
        
        // Update the questions array with the response and speech metrics
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex] = {
          ...updatedQuestions[currentQuestionIndex],
          response: transcribedText,
          speechMetrics: speechMetrics
        };
        setQuestions(updatedQuestions);
        
        // Now, evaluate the response using ChatGPT with voice analysis
        await evaluateResponse(transcribedText, updatedQuestions[currentQuestionIndex].text, speechMetrics);
      };
    } catch (error) {
      console.error("Error processing recording:", error);
      toast({
        title: "Error",
        description: "Failed to process your recording. Please try again.",
        variant: "destructive"
      });
      setProcessingResponse(false);
      setVoiceMode(null);
    }
  };
  
  // Evaluate the response using OpenAI
  const evaluateResponse = async (response: string, question: string, speechMetrics: any = {}) => {
    try {
      // Call our edge function to evaluate the response with voice analysis
      const evalResponse = await supabase.functions.invoke("interview-assistant", {
        body: {
          sessionId,
          prompt: `You are an expert interviewer evaluating a candidate's response. 
          
          Question: "${question}"
          
          Candidate's response: "${response}"
          
          Please evaluate the response on the following criteria:
          1. Relevance (0-100): How well did the candidate address the question?
          2. Clarity (0-100): How clear and articulate was the response?
          3. Confidence (0-100): How confident did the candidate seem in their answer?
          4. Overall (0-100): Overall impression of the response.
          
          Also analyze the speech metrics:
          - Words per minute: ${speechMetrics.wordsPerMinute || 'Not available'}
          - Number of filler words: ${speechMetrics.fillerWords || 'Not available'}
          - Number of pauses: ${speechMetrics.pauses || 'Not available'}
          
          Based on both the content and delivery, provide a short paragraph of feedback on what was good and how the response could be improved.
          
          Return your evaluation in this exact format:
          
          RELEVANCE: [score]
          CLARITY: [score]
          CONFIDENCE: [score]
          OVERALL: [score]
          FEEDBACK: [your detailed feedback paragraph]
          `,
          category: session?.category || "",
          voiceAnalysis: true,
          voiceData: response
        }
      });
      
      // Check if the response was successful
      if (evalResponse.error) {
        throw new Error(evalResponse.error.message || "Failed to evaluate response");
      }

      if (!evalResponse.data || !evalResponse.data.aiResponse) {
        throw new Error("No evaluation data received");
      }
      
      const aiResponseText = evalResponse.data.aiResponse;
      const voiceMetrics = evalResponse.data.voiceMetrics || {};
      
      // Parse the evaluation
      const relevanceMatch = aiResponseText.match(/RELEVANCE: (\d+)/);
      const clarityMatch = aiResponseText.match(/CLARITY: (\d+)/);
      const confidenceMatch = aiResponseText.match(/CONFIDENCE: (\d+)/);
      const overallMatch = aiResponseText.match(/OVERALL: (\d+)/);
      const feedbackMatch = aiResponseText.match(/FEEDBACK: ([\s\S]+)$/);
      
      const evaluation = {
        relevance: relevanceMatch ? parseInt(relevanceMatch[1]) : 0,
        clarity: clarityMatch ? parseInt(clarityMatch[1]) : 0,
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 0,
        overall: overallMatch ? parseInt(overallMatch[1]) : 0,
        feedback: feedbackMatch ? feedbackMatch[1].trim() : ""
      };
      
      // Update the questions array with the evaluation and enhanced speech metrics
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        evaluation,
        speechMetrics: {
          ...updatedQuestions[currentQuestionIndex].speechMetrics,
          confidence: voiceMetrics?.confidence || updatedQuestions[currentQuestionIndex].speechMetrics?.confidence,
          fluency: voiceMetrics?.fluency || updatedQuestions[currentQuestionIndex].speechMetrics?.fluency,
          clarity: voiceMetrics?.clarity || updatedQuestions[currentQuestionIndex].speechMetrics?.clarity
        }
      };
      setQuestions(updatedQuestions);
      
      // If this is not the last question, generate the next question
      if (currentQuestionIndex < 4) {
        // Generate next question
        await generateNextQuestion(response, question, session?.category || "");
      } else {
        // This was the last question, complete the interview
        await completeInterview(updatedQuestions);
      }
    } catch (error) {
      console.error("Error evaluating response:", error);
      toast({
        title: "Error",
        description: "Failed to evaluate your response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingResponse(false);
      setVoiceMode(null);
    }
  };
  
  // Generate the next question
  const generateNextQuestion = async (
    prevResponse: string, 
    prevQuestion: string, 
    category: string
  ) => {
    try {
      setVoiceMode('processing');
      
      // Call our edge function to get the next question with audio
      const response = await supabase.functions.invoke("interview-assistant", {
        body: {
          sessionId,
          prompt: `You are conducting a ${category} interview. 
          
          The previous question was: "${prevQuestion}"
          
          The candidate's response was: "${prevResponse}"
          
          Based on this, provide a logical follow-up question that would be asked in this type of interview. Make it sound natural as if a real interviewer is asking the question. The question should probe deeper or explore a different aspect relevant to the interview category. Keep your question concise and direct.`,
          category,
          generateAudio: true
        }
      });
      
      // Check if the response was successful
      if (response.error) {
        throw new Error(response.error.message || "Failed to generate next question");
      }

      if (!response.data) {
        throw new Error("No question data received");
      }
      
      // Add the new question
      setQuestions(prev => [
        ...prev,
        {
          id: `q-${Date.now()}`,
          text: response.data.aiResponse,
          audioContent: response.data.audioContent
        }
      ]);
      
      // Move to the next question
      setCurrentQuestionIndex(prev => prev + 1);
      
      // Reset audio URL for the new question
      setAudioUrl(null);
      
      toast({
        title: "Next question ready",
        description: "The interviewer will ask the next question now.",
      });
    } catch (error) {
      console.error("Error generating next question:", error);
      toast({
        title: "Error",
        description: "Failed to generate next question. Please try again.",
        variant: "destructive"
      });
      setVoiceMode(null);
    }
  };
  
  // Complete the interview
  const completeInterview = async (finalQuestions: Question[]) => {
    try {
      // Calculate average scores
      const scores = finalQuestions
        .filter(q => q.evaluation)
        .map(q => q.evaluation!.overall);
      
      const averageScore = scores.length > 0
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;
      
      // Generate overall feedback
      const feedbackResponse = await supabase.functions.invoke("interview-assistant", {
        body: {
          sessionId,
          prompt: `You are an expert interviewer providing final feedback for a ${session?.category} interview. 
          
          The candidate answered ${finalQuestions.length} questions. Here are the questions and responses:
          
          ${finalQuestions.map((q, i) => `
          Question ${i + 1}: ${q.text}
          Response: ${q.response || "No response"}
          Evaluation: 
          - Relevance: ${q.evaluation?.relevance || 0}/100
          - Clarity: ${q.evaluation?.clarity || 0}/100
          - Confidence: ${q.evaluation?.confidence || 0}/100
          - Overall: ${q.evaluation?.overall || 0}/100
          
          Speech Metrics (if available):
          - Words per minute: ${q.speechMetrics?.wordsPerMinute || 'Not available'}
          - Filler words: ${q.speechMetrics?.fillerWords || 'Not available'}
          - Confidence: ${q.speechMetrics?.confidence || 'Not available'}
          - Clarity: ${q.speechMetrics?.clarity || 'Not available'}
          `).join("\n")}
          
          Based on both the content of the answers and the delivery (speech patterns, confidence, clarity), provide comprehensive feedback (about 3-4 paragraphs) on the candidate's performance, highlighting strengths and areas for improvement. The feedback should be constructive, specific, and actionable.`,
          category: session?.category || ""
        }
      });
      
      // Check if the response was successful
      if (feedbackResponse.error) {
        throw new Error(feedbackResponse.error.message || "Failed to generate feedback");
      }
      
      if (!feedbackResponse.data || !feedbackResponse.data.aiResponse) {
        throw new Error("No feedback data received");
      }

      // Update the session in the database
      const { error } = await supabase
        .from("interview_sessions")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          score: averageScore,
          feedback: feedbackResponse.data.aiResponse
        })
        .eq("id", sessionId);
      
      if (error) throw error;
      
      // Update the session state
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          completed: true,
          completed_at: new Date().toISOString(),
          score: averageScore,
          feedback: feedbackResponse.data.aiResponse
        };
      });
      
      toast({
        title: "Interview completed",
        description: "Your session has been saved. View your results below.",
      });
    } catch (error) {
      console.error("Error completing interview:", error);
      toast({
        title: "Error",
        description: "Failed to complete the interview. Your progress has been saved.",
        variant: "destructive"
      });
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 max-w-7xl flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center bg-black/40 p-8 rounded-xl backdrop-blur-sm"
          >
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
            <p className="text-lg font-medium mb-2">Loading your interview session</p>
            <p className="text-muted-foreground">
              Preparing questions for {session?.category || "your"} interview...
            </p>
          </motion.div>
        </main>
      </div>
    );
  }
  
  // Render completed interview
  if (session?.completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
          <div className="mb-6">
            <Link to="/interview-prep" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Interview Prep
            </Link>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 backdrop-blur-md rounded-xl p-8 mb-8 border border-primary/20 shadow-lg"
          >
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-white">Interview Completed</h1>
                <p className="text-primary/80">
                  {session.category} Interview • {new Date(session.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        className="fill-none stroke-white/10" 
                        strokeWidth="8" 
                        cx="50" 
                        cy="50" 
                        r="40"
                      />
                      <circle 
                        className="fill-none stroke-primary" 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                        strokeDasharray={`${(session.score || 0) * 2.51} 251`}
                        strokeDashoffset="0" 
                        cx="50" 
                        cy="50" 
                        r="40"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className="text-3xl font-bold text-white">{session.score || 0}</div>
                      <div className="text-xs text-primary/80">SCORE</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="bg-white/5 p-2 rounded-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-400" />
                    <span className="text-sm">{getPerformanceLabel(session.score || 0)}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-green-400" />
                    <span className="text-sm">All Questions Answered</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Overall Feedback
              </h2>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <p className="whitespace-pre-line text-white/90">{session.feedback}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Detailed Breakdown
              </h2>
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <motion.div 
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-6 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="font-medium text-lg">Question {index + 1}</div>
                    </div>
                    
                    <p className="mb-6 text-white/90">{question.text}</p>
                    
                    {question.response && (
                      <div className="mb-6">
                        <div className="font-medium mb-2 text-primary/80">Your Response:</div>
                        <p className="text-white/70 bg-black/20 p-4 rounded-lg border border-white/5">{question.response}</p>
                      </div>
                    )}
                    
                    {question.speechMetrics && Object.keys(question.speechMetrics).length > 0 && (
                      <SpeechMetricsCard metrics={question.speechMetrics} className="mb-6" />
                    )}
                    
                    {question.evaluation && (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-black/30 p-3 rounded-lg">
                            <div className="text-sm text-primary/80 mb-1">Relevance</div>
                            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                                style={{ width: `${question.evaluation.relevance}%` }}
                              />
                            </div>
                            <div className="text-right text-sm mt-1 font-medium">{question.evaluation.relevance}/100</div>
                          </div>
                          
                          <div className="bg-black/30 p-3 rounded-lg">
                            <div className="text-sm text-primary/80 mb-1">Clarity</div>
                            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                                style={{ width: `${question.evaluation.clarity}%` }}
                              />
                            </div>
                            <div className="text-right text-sm mt-1 font-medium">{question.evaluation.clarity}/100</div>
                          </div>
                          
                          <div className="bg-black/30 p-3 rounded-lg">
                            <div className="text-sm text-primary/80 mb-1">Confidence</div>
                            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-purple-500 rounded-full"
                                style={{ width: `${question.evaluation.confidence}%` }}
                              />
                            </div>
                            <div className="text-right text-sm mt-1 font-medium">{question.evaluation.confidence}/100</div>
                          </div>
                          
                          <div className="bg-black/30 p-3 rounded-lg">
                            <div className="text-sm text-primary/80 mb-1">Overall</div>
                            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                                style={{ width: `${question.evaluation.overall}%` }}
                              />
                            </div>
                            <div className="text-right text-sm mt-1 font-medium">{question.evaluation.overall}/100</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="font-medium mb-2 text-primary/80">Feedback:</div>
                          <p className="text-white/80">{question.evaluation.feedback}</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => navigate("/interview-prep")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <Button 
              onClick={() => navigate("/interview-prep/session/" + Date.now())}
              className="gap-2 bg-primary hover:bg-primary/80"
            >
              <Mic className="h-4 w-4" />
              Start New Interview
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  // Render active interview
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        <div className="mb-6">
          <Link to="/interview-prep" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interview Prep
          </Link>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-md rounded-xl p-8 mb-8 border border-primary/20 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{session?.category} Interview</h1>
              <p className="text-primary/80">Question {currentQuestionIndex + 1} of 5</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleMute}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="h-5 w-5 text-white/70" /> : <Volume2 className="h-5 w-5 text-white/70" />}
              </button>
              
              <div className="bg-primary/20 text-primary font-medium rounded-full px-4 py-2 text-sm">
                In Progress
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="w-full bg-black/40 h-3 rounded-full mb-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentQuestionIndex / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="bg-primary h-full rounded-full"
              />
            </div>
            <div className="text-xs text-primary/80">
              {Math.round((currentQuestionIndex / 5) * 100)}% Complete
            </div>
          </div>
          
          <div className="mb-6 bg-gradient-to-b from-black/60 to-black/40 border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">Voice Interview</span>
              </div>
              
              <div className="flex items-center gap-3">
                {audioUrl && !processingResponse && (
                  <button
                    onClick={isPlaying ? pauseAudio : playAudio}
                    className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
                  >
                    {isPlaying ? (
                      <CirclePause className="h-5 w-5 text-primary" />
                    ) : (
                      <CirclePlay className="h-5 w-5 text-primary" />
                    )}
                  </button>
                )}
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`p-1.5 rounded ${autoPlay ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'} text-xs flex items-center gap-1`}
                  >
                    <Headphones className="h-3 w-3" />
                    <span>Auto-play</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div 
              ref={chatContainerRef}
              className="h-[400px] overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
              <AnimatePresence>
                {questions.map((question, index) => (
                  <Fragment key={question.id}>
                    {/* Question */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 * index }}
                      className="flex items-start gap-3"
                    >
                      <div className="bg-primary/20 text-primary rounded-full p-2 flex-shrink-0">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="bg-black/40 rounded-lg p-4 inline-block border border-white/5 shadow-lg">
                        <p className="text-white/90">{question.text}</p>
                        {index === currentQuestionIndex && question.audioContent && (
                          <div className="mt-2 text-xs text-primary/70 flex items-center gap-1">
                            <Volume2 className="h-3 w-3" />
                            <span>{isPlaying ? "Playing audio..." : "Audio available"}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                    
                    {/* Response */}
                    {question.response && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 ml-12"
                      >
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block border border-white/5 shadow-lg">
                          <p className="text-white/80">{question.response}</p>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Speech Metrics */}
                    {question.speechMetrics && Object.keys(question.speechMetrics).length > 0 && question.response && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="ml-12 mt-2"
                      >
                        <SpeechMetricsCard metrics={question.speechMetrics} />
                      </motion.div>
                    )}
                    
                    {/* Evaluation */}
                    {question.evaluation && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3"
                      >
                        <div className="bg-green-500/20 text-green-400 rounded-full p-2 flex-shrink-0">
                          <Award className="h-5 w-5" />
                        </div>
                        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-green-500/20 shadow-lg">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-xs text-primary/80">Relevance</div>
                              <div className="font-medium">{question.evaluation.relevance}/100</div>
                            </div>
                            <div>
                              <div className="text-xs text-primary/80">Clarity</div>
                              <div className="font-medium">{question.evaluation.clarity}/100</div>
                            </div>
                            <div>
                              <div className="text-xs text-primary/80">Confidence</div>
                              <div className="font-medium">{question.evaluation.confidence}/100</div>
                            </div>
                            <div>
                              <div className="text-xs text-primary/80">Overall</div>
                              <div className="font-medium">{question.evaluation.overall}/100</div>
                            </div>
                          </div>
                          <p className="text-sm text-white/80">{question.evaluation.feedback}</p>
                        </div>
                      </motion.div>
                    )}
                  </Fragment>
                ))}
                
                {/* Current transcription */}
                {transcription && !questions[currentQuestionIndex]?.response && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 ml-12"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block border border-white/5 shadow-lg">
                      <p className="text-white/80">{transcription}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Voice indicator */}
              {voiceMode && (
                <div className="flex justify-center py-4">
                  <VoiceIndicator isActive={true} type={voiceMode} />
                </div>
              )}
              
              {/* Processing indicator */}
              {processingResponse && !voiceMode && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center gap-2 text-sm text-primary/80">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing your response...
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-white/10 bg-black/30 flex justify-center">
              <AnimatePresence mode="wait">
                {!recording && !processingResponse && questions[currentQuestionIndex] && !questions[currentQuestionIndex].response && !isAiSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button 
                      onClick={startRecording} 
                      size="lg"
                      className="gap-2 h-12 px-6 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/30"
                    >
                      <Mic className="h-5 w-5" />
                      Start Recording
                    </Button>
                  </motion.div>
                )}
                
                {recording && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-2">
                      <div className="absolute -inset-1 animate-ping bg-red-500 rounded-full opacity-30"></div>
                      <Button 
                        onClick={stopRecording} 
                        size="lg"
                        variant="destructive"
                        className="gap-2 h-12 px-6 relative shadow-lg shadow-red-900/30"
                      >
                        <MicOff className="h-5 w-5" />
                        Stop Recording
                      </Button>
                    </div>
                    <div className="text-xs text-primary">Recording in progress...</div>
                  </motion.div>
                )}
                
                {processingResponse && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button disabled className="gap-2 shadow-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </Button>
                  </motion.div>
                )}
                
                {questions[currentQuestionIndex]?.response && !processingResponse && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button disabled className="gap-2 shadow-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Evaluating response...
                    </Button>
                  </motion.div>
                )}
                
                {isAiSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="text-center text-white/80">
                      AI Interviewer is speaking...
                    </div>
                    <Button 
                      onClick={pauseAudio}
                      variant="secondary"
                      size="sm"
                      className="gap-2 shadow-sm"
                    >
                      <CirclePause className="h-4 w-4" />
                      Pause
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="text-sm text-white/70 bg-black/20 p-4 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Listen to the interviewer's questions and respond clearly by voice.</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Your speech will be analyzed for confidence, clarity, and fluency.</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

// Helper function to get performance label based on score
const getPerformanceLabel = (score: number): string => {
  if (score >= 90) return "Outstanding";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Satisfactory";
  return "Needs Improvement";
};

export default InterviewSession;
