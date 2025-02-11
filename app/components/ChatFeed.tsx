"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { useWindowSize } from "usehooks-ts";
import { EqualIcon } from "lucide-react";
import { BrowserSession } from "../api/operatorProvider";

interface ChatFeedProps {
  initialMessage?: string;
  onClose: () => void;
  url?: string;
}


export default function ChatFeed({ initialMessage, onClose }: ChatFeedProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAgentFinished, setIsAgentFinished] = useState(false);

  // UI state holds our sessionId, sessionUrl, and the aggregated sessions.
  const [uiState, setUiState] = useState<{
    session: BrowserSession | null;
    sessionId: string | null;
    sessionUrl: string | null;
  }>({
    session: null,
    sessionId: null,
    sessionUrl: null,
  });

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // Finalize the session if the latest status is "finished" or "failed".
  useEffect(() => {
    if (
      uiState.session &&
      (uiState.session.status === "finished" || uiState.session.status === "failed")
    ) {
      setIsAgentFinished(true);
    }
  }, [uiState.session]);

  // Scroll chat to bottom whenever new sessions are added.
  useEffect(() => {
    scrollToBottom();
  }, [uiState.session, scrollToBottom]);

  // Initialize session.
  useEffect(() => {
    const initializeSession = async () => {
      if (initialMessage && !uiState.sessionId) {
        setIsLoading(true);
        try {
          // Create a new session.
          const sessionResponse = await fetch("/api/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              goal: initialMessage,
            }),
          });
          const sessionData = await sessionResponse.json();
          if (!sessionData.success) {
            throw new Error(sessionData.error || "Failed to create session");
          }
          setUiState({
            sessionId: sessionData.sessionId,
            sessionUrl: sessionData.sessionUrl,
            session: null,
          });
        } catch (error) {
          console.error("Error initializing session:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    initializeSession();
  }, [initialMessage, uiState]);

  // Subscribe to status updates using getTaskStatus via subscribeTaskStatus.
  useEffect(() => {
    if (!uiState.sessionId || isAgentFinished) return;
    
    const eventSource = new EventSource(`/api/session/status?sessionId=${uiState.sessionId}`);
    
    eventSource.onmessage = (event) => {
      try {
        console.log('Raw event data:', event.data);
        const session: BrowserSession = JSON.parse(event.data);
        
        // Check if this is a finished/failed status immediately
        const isComplete = session.status === "finished" || session.status === "failed";
        
        setUiState((prev) => ({
          ...prev,
          session,
        }));

        // Close the connection immediately if we're done
        if (isComplete) {
          console.log(`Session ${session.status}, closing connection`);
          eventSource.close();
        }
      } catch (error) {
        console.error("Error parsing session data:", error);
        console.error("Raw data:", event.data);
      }
    };

    eventSource.onerror = (event: Event) => {
      // Check if this is a normal closure (readyState === 2) and we have a finished session
      const source = event.target as EventSource;
      if (source.readyState === 2 && uiState.session?.status === "finished") {
        console.log("Connection closed normally after session completion");
        return;
      }
      
      // Log actual errors
      console.error("EventSource error:", {
        readyState: source.readyState,
        sessionStatus: uiState.session?.status,
      });
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [uiState.sessionId, isAgentFinished, uiState.session?.status]);

  // Spring configuration for smoother animations.
  const springConfig = {
    type: "spring",
    stiffness: 350,
    damping: 30,
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { ...springConfig, staggerChildren: 0.1 },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.nav
        className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-1">
          <EqualIcon className="w-4 h-4" />
          <span className="font-inter font-semibold text-black">Midpilot</span>
        </div>
        <motion.button
          onClick={onClose}
          className="px-4 py-2 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors rounded-md font-inter flex items-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          Close
          {!isMobile && (
            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded-md">ESC</kbd>
          )}
        </motion.button>
      </motion.nav>
      <main className="flex-1 flex flex-col items-center sm:p-6">
        <motion.div
          className="w-full max-w-[1280px] bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-full h-12 bg-white border-b border-gray-200 flex items-center px-4"></div>
          <div className="flex flex-col md:flex-row">
            {uiState.sessionUrl && !isAgentFinished && (
              <div className="flex-1 p-6 border-b md:border-b-0 md:border-l border-gray-200 order-first md:order-last">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-full aspect-video"
                >
                  <iframe
                    src={uiState.sessionUrl}
                    className="w-full h-full"
                    sandbox="allow-same-origin allow-scripts allow-forms"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    title="Browser Session"
                  />
                </motion.div>
              </div>
            )}
            <div className="flex-1 p-6">
              <div className="flex flex-col gap-4" ref={chatContainerRef}>
                {/* Show initial goal */}
                {initialMessage && (
                  <motion.div
                    variants={messageVariants}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-md"
                  >
                    <p className="font-medium mb-1">Goal:</p>
                    <p>{initialMessage}</p>
                  </motion.div>
                )}

                {/* Show session updates */}
                {uiState.session && (
                  <motion.div
                    variants={messageVariants}
                    className="p-4 border border-gray-200 rounded-md"
                  >
                    {/* Show current output */}
                    <p>{uiState.session.output}</p>
                    
                    {/* Show steps */}
                    {uiState.session.steps.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uiState.session.steps.map((step) => (
                          <div key={step.id} className="bg-gray-50 p-3 rounded-md">
                            <p className="font-medium">Step {step.step}</p>
                            <p className="text-gray-700">{step.next_goal}</p>
                            {step.evaluation_previous_goal && (
                              <p className="mt-1 text-sm text-gray-600">
                                Evaluation of last action: {step.evaluation_previous_goal}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show completion message when finished */}
                    {isAgentFinished && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="font-medium text-green-800">
                          Task completed! Final status: {uiState.session.status}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              {isLoading && <p>Loading...</p>}
            </div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
