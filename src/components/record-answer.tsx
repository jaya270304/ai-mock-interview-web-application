/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth } from "@clerk/clerk-react";
import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
// Speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";
import { toast } from "sonner";
import { chatSession } from "@/scripts";
import { SaveModal } from "./save-modal.tsx";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
}: RecordAnswerProps) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [interimResult, setInterimResult] = useState("");

  const { userId } = useAuth();
  const { interviewId } = useParams();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';
        
        recognitionInstance.onstart = () => {
          console.log('Speech recognition started');
          setIsRecording(true);
        };
        
        recognitionInstance.onresult = (event: any) => {
          console.log('Speech recognition result:', event);
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setUserAnswer(prev => prev + finalTranscript);
          }
          setInterimResult(interimTranscript);
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          
          switch (event.error) {
            case 'not-allowed':
              toast.error("Microphone Permission Denied", {
                description: "Please allow microphone access and try again.",
              });
              break;
            case 'no-speech':
              toast.error("No Speech Detected", {
                description: "Please speak clearly and try again.",
              });
              break;
            case 'network':
              toast.error("Network Error", {
                description: "Please check your internet connection.",
              });
              break;
            default:
              toast.error("Speech Recognition Error", {
                description: `Error: ${event.error}. Please try again.`,
              });
          }
        };
        
        recognitionInstance.onend = () => {
          console.log('Speech recognition ended');
          setIsRecording(false);
          setInterimResult("");
        };
        
        setRecognition(recognitionInstance);
      } else {
        toast.error("Browser Not Supported", {
          description: "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.",
        });
      }
    }
  }, []);

  const recordUserAnswer = async () => {
    console.log("recordUserAnswer called, isRecording:", isRecording);
    
    if (isRecording && recognition) {
      console.log("Stopping recording...");
      recognition.stop();

      // Always generate AI result if there's any user answer
      if (userAnswer && userAnswer.trim().length > 0) {
        console.log("Generating AI result for answer:", userAnswer);
        
        // Generate AI result
        const aiResult = await generateResult(
          question.question,
          question.answer,
          userAnswer
        );

        setAiResult(aiResult);
        
        // Show success message
        toast.success("Recording Complete", {
          description: "Your answer has been processed. You can now save the result.",
        });
      } else {
        toast.error("No Answer Recorded", {
          description: "Please record your answer before stopping.",
        });
      }
    } else if (recognition) {
      console.log("Starting recording...");
      
      try {
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognition.start();
      } catch (error) {
        console.error("Microphone access error:", error);
        
        if (error instanceof DOMException) {
          switch (error.name) {
            case 'NotAllowedError':
              toast.error("Microphone Permission Denied", {
                description: "Please allow microphone access in your browser settings and refresh the page.",
              });
              break;
            case 'NotFoundError':
              toast.error("No Microphone Found", {
                description: "No microphone device was found. Please connect a microphone and try again.",
              });
              break;
            case 'NotReadableError':
              toast.error("Microphone Busy", {
                description: "Your microphone is being used by another application. Please close other apps and try again.",
              });
              break;
            default:
              toast.error("Microphone Error", {
                description: "Unable to access microphone. Please check your device settings.",
              });
          }
        }
      }
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    // Step 3: Parse the clean JSON text into an array of objects
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string
  ): Promise<AIResponse> => {
    setIsAiGenerating(true);
    const prompt = `
      Question: "${qst}"
      User Answer: "${userAns}"
      Correct Answer: "${qstAns}"
      Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
      Return the result in JSON format with the fields "ratings" (number) and "feedback" (string).
    `;

    try {
      const aiResult = await chatSession.sendMessage(prompt);

      const parsedResult: AIResponse = cleanJsonResponse(
        aiResult.response.text()
      );
      return parsedResult;
    } catch (error) {
      console.log(error);
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      return { ratings: 0, feedback: "Unable to generate feedback" };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer("");
    setInterimResult("");
    if (recognition && isRecording) {
      recognition.stop();
      setTimeout(() => {
        recognition.start();
      }, 100);
    }
  };

  const saveUserAnswer = async () => {
    setLoading(true);

    if (!aiResult) {
      return;
    }

    const currentQuestion = question.question;
    try {
      // query the firbase to check if the user answer already exists for this question

      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", currentQuestion)
      );

      const querySnap = await getDocs(userAnswerQuery);

      // if the user already answerd the question dont save it again
      if (!querySnap.empty) {
        console.log("Query Snap Size", querySnap.size);
        toast.info("Already Answered", {
          description: "You have already answered this question",
        });
        return;
      } else {
        // save the user answer

        await addDoc(collection(db, "userAnswers"), {
          mockIdRef: interviewId,
          question: question.question,
          correct_ans: question.answer,
          user_ans: userAnswer,
          feedback: aiResult.feedback,
          rating: aiResult.ratings,
          userId,
          createdAt: serverTimestamp(),
        });

        toast("Saved", { description: "Your answer has been saved.." });
      }

      setUserAnswer("");
      setInterimResult("");
      if (recognition && isRecording) {
        recognition.stop();
      }
    } catch (error) {
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(!open);
    }
  };

  // Debug logging for recording state changes
  useEffect(() => {
    console.log("Recording state changed:", isRecording);
    console.log("Current user answer:", userAnswer);
    console.log("Interim result:", interimResult);
  }, [isRecording, userAnswer, interimResult]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-4">
      {/* save modal */}
      <SaveModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={saveUserAnswer}
        loading={loading}
      />

      <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
        {isWebCam ? (
          <WebCam
            onUserMedia={() => setIsWebCam(true)}
            onUserMediaError={() => setIsWebCam(false)}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground" />
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <TooltipButton
          content={isWebCam ? "Turn Off" : "Turn On"}
          icon={
            isWebCam ? (
              <VideoOff className="min-w-5 min-h-5" />
            ) : (
              <Video className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setIsWebCam(!isWebCam)}
        />

        <TooltipButton
          content={isRecording ? "Stop Recording" : "Start Recording"}
          icon={
            isRecording ? (
              <CircleStop className="min-w-5 min-h-5" />
            ) : (
              <Mic className="min-w-5 min-h-5" />
            )
          }
          onClick={recordUserAnswer}
        />

        <TooltipButton
          content="Record Again"
          icon={<RefreshCw className="min-w-5 min-h-5" />}
          onClick={recordNewAnswer}
        />

        <TooltipButton
          content="Save Result"
          icon={
            isAiGenerating ? (
              <Loader className="min-w-5 min-h-5 animate-spin" />
            ) : (
              <Save className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setOpen(!open)}
          disabled={!aiResult}
        />
      </div>

      <div className="w-full mt-4 p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold">Your Answer:</h2>

        <p className="text-sm mt-2 text-gray-700 whitespace-normal">
          {userAnswer || "Start recording to see your ansewer here"}
        </p>

        {interimResult && (
          <p className="text-sm text-gray-500 mt-2">
            <strong>Current Speech:</strong>
            {interimResult}
          </p>
        )}
      </div>
    </div>
  );
};
