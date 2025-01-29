"use client";

import {RegisterLink, LoginLink, LogoutLink} from "@kinde-oss/kinde-auth-nextjs/components";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import ChatFeed from "./components/ChatFeed";
import AnimatedButton from "./components/AnimatedButton";
import posthog from "posthog-js";
import { EqualIcon } from "lucide-react";
import {useKindeBrowserClient} from "@kinde-oss/kinde-auth-nextjs";


export default function Home() {
  const {isAuthenticated, user} = useKindeBrowserClient();
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    console.log(isAuthenticated)
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

  // Add click outside listener to close the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById('user-menu');
      if (userMenu && !userMenu.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="relative" id="user-menu">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                      {user?.given_name?.[0] || user?.email?.[0] || '?'}
                    </div>
                    <span className="text-sm font-inter text-gray-600">
                    </span>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 min-w-[240px] w-max bg-white rounded-md shadow-lg border border-gray-200 py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.given_name || user?.email?.split('@')[0]}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <LogoutLink className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                        Sign out
                      </LogoutLink>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <LoginLink className="text-sm font-inter text-gray-600 hover:text-gray-900">Sign in</LoginLink>
                  <RegisterLink className="px-4 py-2 text-sm font-inter text-white bg-black rounded-md hover:bg-gray-800">Sign up</RegisterLink>
                </>
              )}
            </div>
          </nav>

          {/* Main Content */}
          {/* <LoginLink>Login</LoginLink>
          <RegisterLink>Register</RegisterLink>
          <LogoutLink>Logout</LogoutLink> */}
          <main className="flex-1 flex flex-col items-start justify-start sm:items-center sm:justify-center sm:p-6">
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
                    onClick={() =>
                      startChat("Find out what the company Midpilot does")
                    }
                    className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
                  >
                    Find out what the company Midpilot does
                  </button>
                  <button
                    onClick={() =>
                      startChat(
                        "Find the price of Bitcoin"
                      )
                    }
                    className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
                  >
                    Find the price of Bitcoin
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
                        "Give me an overview of the latest articles on Shifter.no"
                      )
                    }
                    className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
                  >
                    Give me an overview of the latest articles on Shifter.no
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
