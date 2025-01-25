"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import ChatFeed from "./components/ChatFeed";
import AnimatedButton from "./components/AnimatedButton";
import posthog from "posthog-js";
import { EqualIcon } from "lucide-react";


export default function Home() {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle CMD+Enter to submit the form when chat is not visible
      if (!isChatVisible && (e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        const form = document.querySelector("form") as HTMLFormElement;
        if (form) {
          form.requestSubmit();
        }
      }

      // Handle CMD+K to focus input when chat is not visible
      if (!isChatVisible && (e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.querySelector(
          'input[name="message"]'
        ) as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }

      // Handle ESC to close chat when visible
      if (isChatVisible && e.key === "Escape") {
        e.preventDefault();
        setIsChatVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isChatVisible]);

  const startChat = useCallback(
    (finalMessage: string) => {
      setInitialMessage(finalMessage);
      setIsChatVisible(true);

      try {
        posthog.capture("submit_message", {
          message: finalMessage,
        });
      } catch (e) {
        console.error(e);
      }
    },
    [setInitialMessage, setIsChatVisible]
  );

  return (
    <AnimatePresence mode="wait">
      {!isChatVisible ? (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Top Navigation */}
          <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-1">
                <EqualIcon className="w-4 h-4" />
              <span className="font-inter font-semibold text-black">Midpilot</span>
            </div>
            <div className="flex items-center gap-2">
              
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-start justify-start sm:items-center sm:justify-center sm:p-6">
            <div className="w-full max-w-[640px] bg-white border border-gray-200 shadow-sm overflow-hidden rounded-lg">
             
              <div className="p-8 flex flex-col items-center gap-8">
                <div className="flex flex-col items-center gap-3">
                  <h1 className="text-2xl font-inter font-semibold text-black text-center">
                    Midpilot
                  </h1>
                  <p className="text-base font-inter text-black text-center">
                  Let AI work for you using its own browser.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const input = e.currentTarget.querySelector(
                      'input[name="message"]'
                    ) as HTMLInputElement;
                    const message = (formData.get("message") as string).trim();
                    const finalMessage = message || input.placeholder;
                    startChat(finalMessage);
                  }}
                  className="w-full max-w-[720px] flex flex-col items-center gap-3"
                >
                  <div className="relative w-full">
                    <input
                      name="message"
                      type="text"
                      placeholder="What's the price of NVIDIA stock?"
                      className="w-full px-4 py-3 pr-[100px] border border-black text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-inter rounded-md"
                    />
                    <AnimatedButton type="submit">Run</AnimatedButton>
                  </div>
                </form>
                <div className="grid grid-cols-2 gap-3 w-full">
                  
                  <button
                    onClick={() =>
                      startChat("What does the company Midpilot do?")
                    }
                    className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
                  >
                    What does the company Midpilot do?
                  </button>
                  <button
                    onClick={() =>
                      startChat(
                        "Find the latest price of Bitcoin"
                      )
                    }
                    className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
                  >
                    What is the price of Bitcoin?
                  </button>
                  <button
                    onClick={() => startChat("Summarize NN groups latest article")}
                    className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
                  >
                    Summarize NN group&rsquo;s latest article
                  </button>
                  <button
                    onClick={() =>
                      startChat(
                        "What is the latest news on Shifter.no"
                      )
                    }
                    className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
                  >
                    What is the latest news on Shifter.no?
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col p-6 items-center justify-center">
            <p className="font-semibold font-inter text-center mt-8">
              Built by{" "}
              <a
                href="https://midpilot.com"
                className=" hover:underline"
              >
                Midpilot
              </a>
          
              .
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              By using this service, you agree to our{" "}
              <a
                href="https://midpilot.com/terms"
                className="underline hover:text-gray-700"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="https://midpilot.com/privacy"
                className="underline hover:text-gray-700"
              >
                Privacy Policy
              </a>
              .
            </p>
            </div>
          </main>
        </div>
      ) : (
        <ChatFeed
          initialMessage={initialMessage}
          onClose={() => setIsChatVisible(false)}
        />
      )}
    </AnimatePresence>
  );
}
