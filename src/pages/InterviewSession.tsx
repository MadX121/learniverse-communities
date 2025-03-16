
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Mic, MicOff, Loader2, ArrowLeft, MessageSquare, Zap, Award } from "lucide-react";
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
  response?: string;
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
  
  // Media recorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
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
      // Call our edge function to get a question
      const response = await supabase.functions.invoke("interview-assistant", {
        body: {
          sessionId,
          prompt: `You are conducting a ${category} interview. Provide a challenging first question that would be asked in this type of interview. Make it sound like a real interviewer is asking the question.`,
          category
        }
      });
      
      const { aiResponse } = await response.json();
      
      if (aiResponse) {
        setQuestions([{
          id: `q-${Date.now()}`,
          text: aiResponse
        }]);
      } else {
        throw new Error("Failed to generate question");
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
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone.",
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
        const base64Audio = reader.result?.toString().split(',')[1];
        
        if (!base64Audio) {
          throw new Error("Failed to convert audio to base64");
        }
        
        // First, transcribe the audio using Whisper API via an edge function
        const transcribeResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            audio: base64Audio,
            model: "whisper-1"
          })
        });
        
        const transcriptionData = await transcribeResponse.json();
        const transcribedText = transcriptionData.text || "";
        setTranscription(transcribedText);
        
        // Update the questions array with the response
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex] = {
          ...updatedQuestions[currentQuestionIndex],
          response: transcribedText
        };
        setQuestions(updatedQuestions);
        
        // Now, evaluate the response using ChatGPT
        await evaluateResponse(transcribedText, updatedQuestions[currentQuestionIndex].text);
      };
    } catch (error) {
      console.error("Error processing recording:", error);
      toast({
        title: "Error",
        description: "Failed to process your recording. Please try again.",
        variant: "destructive"
      });
      setProcessingResponse(false);
    }
  };
  
  // Evaluate the response using OpenAI
  const evaluateResponse = async (response: string, question: string) => {
    try {
      // Call our edge function to evaluate the response
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
          
          Also provide a short paragraph of feedback on what was good and how the response could be improved.
          
          Return your evaluation in this exact format:
          
          RELEVANCE: [score]
          CLARITY: [score]
          CONFIDENCE: [score]
          OVERALL: [score]
          FEEDBACK: [your detailed feedback paragraph]
          `,
          category: session?.category || ""
        }
      });
      
      const { aiResponse } = await evalResponse.json();
      
      if (aiResponse) {
        // Parse the evaluation
        const relevanceMatch = aiResponse.match(/RELEVANCE: (\d+)/);
        const clarityMatch = aiResponse.match(/CLARITY: (\d+)/);
        const confidenceMatch = aiResponse.match(/CONFIDENCE: (\d+)/);
        const overallMatch = aiResponse.match(/OVERALL: (\d+)/);
        const feedbackMatch = aiResponse.match(/FEEDBACK: ([\s\S]+)$/);
        
        const evaluation = {
          relevance: relevanceMatch ? parseInt(relevanceMatch[1]) : 0,
          clarity: clarityMatch ? parseInt(clarityMatch[1]) : 0,
          confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 0,
          overall: overallMatch ? parseInt(overallMatch[1]) : 0,
          feedback: feedbackMatch ? feedbackMatch[1].trim() : ""
        };
        
        // Update the questions array with the evaluation
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex] = {
          ...updatedQuestions[currentQuestionIndex],
          evaluation
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
    }
  };
  
  // Generate the next question
  const generateNextQuestion = async (
    prevResponse: string, 
    prevQuestion: string, 
    category: string
  ) => {
    try {
      // Call our edge function to get the next question
      const response = await supabase.functions.invoke("interview-assistant", {
        body: {
          sessionId,
          prompt: `You are conducting a ${category} interview. 
          
          The previous question was: "${prevQuestion}"
          
          The candidate's response was: "${prevResponse}"
          
          Based on this, provide a logical follow-up question that would be asked in this type of interview. Make it sound natural as if a real interviewer is asking the question. The question should probe deeper or explore a different aspect relevant to the interview category.`,
          category
        }
      });
      
      const { aiResponse } = await response.json();
      
      if (aiResponse) {
        // Add the new question
        setQuestions(prev => [
          ...prev,
          {
            id: `q-${Date.now()}`,
            text: aiResponse
          }
        ]);
        
        // Move to the next question
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error generating next question:", error);
      toast({
        title: "Error",
        description: "Failed to generate next question. Please try again.",
        variant: "destructive"
      });
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
          `).join("\n")}
          
          Based on these answers, provide comprehensive feedback (about 3-4 paragraphs) on the candidate's performance, highlighting strengths and areas for improvement. The feedback should be constructive, specific, and actionable.`,
          category: session?.category || ""
        }
      });
      
      const { aiResponse } = await feedbackResponse.json();
      
      // Update the session in the database
      const { error } = await supabase
        .from("interview_sessions")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          score: averageScore,
          feedback: aiResponse
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
          feedback: aiResponse
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 max-w-7xl flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading interview session...</p>
          </div>
        </main>
      </div>
    );
  }
  
  // Render completed interview
  if (session?.completed) {
    return (
      <div className="min-h-screen bg-background">
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
            className="bg-secondary/30 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Interview Completed</h1>
                <p className="text-muted-foreground">
                  {session.category} Interview • {new Date(session.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{session.score || 0}</div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Overall Feedback</h2>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="whitespace-pre-line">{session.feedback}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Detailed Breakdown</h2>
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-white/5 rounded-lg p-4">
                    <div className="font-medium mb-2">Question {index + 1}:</div>
                    <p className="mb-4">{question.text}</p>
                    
                    {question.response && (
                      <>
                        <div className="font-medium mb-2">Your Response:</div>
                        <p className="mb-4 text-muted-foreground">{question.response}</p>
                      </>
                    )}
                    
                    {question.evaluation && (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Relevance</div>
                            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                                style={{ width: `${question.evaluation.relevance}%` }}
                              />
                            </div>
                            <div className="text-right text-sm mt-1">{question.evaluation.relevance}/100</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Clarity</div>
                            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                                style={{ width: `${question.evaluation.clarity}%` }}
                              />
                            </div>
                            <div className="text-right text-sm mt-1">{question.evaluation.clarity}/100</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-purple-500 rounded-full"
                                style={{ width: `${question.evaluation.confidence}%` }}
                              />
                            </div>
                            <div className="text-right text-sm mt-1">{question.evaluation.confidence}/100</div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Overall</div>
                            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                                style={{ width: `${question.evaluation.overall}%` }}
                              />
                            </div>
                            <div className="text-right text-sm mt-1">{question.evaluation.overall}/100</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="font-medium mb-2">Feedback:</div>
                          <p className="text-sm">{question.evaluation.feedback}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => navigate("/interview-prep")}
            >
              Back to Dashboard
            </Button>
            
            <Button 
              onClick={() => navigate("/interview-prep/session/" + Date.now())}
            >
              Start New Interview
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  // Render active interview
  return (
    <div className="min-h-screen bg-background">
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
          className="bg-secondary/30 rounded-xl p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">{session?.category} Interview</h1>
              <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of 5</p>
            </div>
            
            <div className="bg-primary/10 text-primary font-medium rounded-full px-4 py-2 text-sm">
              In Progress
            </div>
          </div>
          
          <div className="mb-4">
            <div className="w-full bg-black/20 h-2 rounded-full mb-1 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${(currentQuestionIndex / 5) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round((currentQuestionIndex / 5) * 100)}% Complete
            </div>
          </div>
          
          <div className="border border-white/10 rounded-lg bg-white/5 h-[400px] mb-6 overflow-hidden flex flex-col">
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              <AnimatePresence>
                {questions.map((question, index) => (
                  <React.Fragment key={question.id}>
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
                      <div className="bg-secondary/50 rounded-lg p-3 inline-block">
                        <p>{question.text}</p>
                      </div>
                    </motion.div>
                    
                    {/* Response */}
                    {question.response && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 ml-12"
                      >
                        <div className="bg-secondary/80 rounded-lg p-3 inline-block">
                          <p>{question.response}</p>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Evaluation */}
                    {question.evaluation && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3"
                      >
                        <div className="bg-green-500/20 text-green-500 rounded-full p-2 flex-shrink-0">
                          <Award className="h-5 w-5" />
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Relevance</div>
                              <div className="font-medium">{question.evaluation.relevance}/100</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Clarity</div>
                              <div className="font-medium">{question.evaluation.clarity}/100</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Confidence</div>
                              <div className="font-medium">{question.evaluation.confidence}/100</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Overall</div>
                              <div className="font-medium">{question.evaluation.overall}/100</div>
                            </div>
                          </div>
                          <p className="text-sm">{question.evaluation.feedback}</p>
                        </div>
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
                
                {/* Current transcription */}
                {transcription && !questions[currentQuestionIndex]?.response && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 ml-12"
                  >
                    <div className="bg-secondary/80 rounded-lg p-3 inline-block">
                      <p>{transcription}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Processing indicator */}
              {processingResponse && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing your response...
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-white/10 flex justify-center">
              <AnimatePresence mode="wait">
                {!recording && !processingResponse && questions[currentQuestionIndex] && !questions[currentQuestionIndex].response && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button 
                      onClick={startRecording} 
                      size="lg"
                      className="gap-2 h-12 px-6 bg-green-600 hover:bg-green-700 text-white"
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
                        className="gap-2 h-12 px-6 relative"
                      >
                        <MicOff className="h-5 w-5" />
                        Stop Recording
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">Recording...</div>
                  </motion.div>
                )}
                
                {processingResponse && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button disabled className="gap-2">
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
                    <Button disabled className="gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Evaluating response...
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Speak clearly and naturally as if in a real interview.</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Your response will be evaluated on relevance, clarity, and confidence.</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default InterviewSession;
