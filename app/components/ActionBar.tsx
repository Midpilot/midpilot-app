"use client";

import { useCallback, useState, useEffect } from "react";
import AnimatedButton from "./AnimatedButton";
import posthog from "posthog-js";
import { useKindeBrowserClient, LoginLink } from "@kinde-oss/kinde-auth-nextjs";

interface ActionBarProps {
  onStartChat: (message: string) => void;
}

const ActionBar = ({ onStartChat }: ActionBarProps) => {
  const {isAuthenticated} = useKindeBrowserClient();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const startChat = useCallback(
    (finalMessage: string) => {
      onStartChat(finalMessage);
      
      try {
        posthog.capture("submit_message", {
          message: finalMessage,
        });
      } catch (e) {
        console.error(e);
      }
    },
    [onStartChat]
  );

  // Check for pending message in localStorage on load
  useEffect(() => {
    if (isAuthenticated) {
      const storedMessage = localStorage.getItem('pendingMessage');
      if (storedMessage) {
        startChat(storedMessage);
        localStorage.removeItem('pendingMessage');
      }
    }
  }, [isAuthenticated, startChat]);

  const handleAuth = (message: string) => {
    localStorage.setItem('pendingMessage', message);
    setShowLoginPrompt(true);
  };

  const handleProposalClick = (message: string) => {
    if (!isAuthenticated) {
      handleAuth(message);
      return;
    }
    startChat(message);
  };

  return (
    <>
      <div className="w-full max-w-[640px] bg-white border border-gray-200 shadow-sm overflow-hidden rounded-lg">
        <div className="p-8 flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-2xl font-inter font-semibold text-black text-center">
              What do you want Midpilot to do?
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
              if (!isAuthenticated) {
                handleAuth(finalMessage);
                return;
              }
              startChat(finalMessage);
            }}
            className="w-full max-w-[720px] flex flex-col items-center gap-3"
          >
            <div className="relative w-full">
              <input
                name="message"
                type="text"
                placeholder="Find the price of NVIDIA stock"
                className="w-full px-4 py-3 pr-[100px] border border-black text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-inter rounded-md"
              />
              <AnimatedButton type="submit">Run</AnimatedButton>
            </div>
          </form>
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => handleProposalClick("Find out what the company Midpilot does")}
              className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
            >
              Find out what the company Midpilot does
            </button>
            <button
              onClick={() => handleProposalClick("Find the price of Bitcoin")}
              className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
            >
              Find the price of Bitcoin
            </button>
            <button
              onClick={() => handleProposalClick("Summarize NN groups latest article")}
              className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
            >
              Summarize NN group&rsquo;s latest article
            </button>
            <button
              onClick={() => handleProposalClick("Give me an overview of the latest articles on Shifter.no")}
              className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
            >
              Give me an overview of the latest articles on Shifter.no
            </button>
          </div>
        </div>
      </div>

      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Sign in to continue</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to use Midpilot and run your requests.
            </p>
            <div className="flex gap-4">
              <LoginLink 
                className="flex-1 bg-black text-white px-4 py-2 rounded-md text-center hover:bg-gray-800 transition-colors"
                postLoginRedirectURL="/"
              >
                Sign in
              </LoginLink>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionBar;
