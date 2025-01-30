"use client";

import { useCallback } from "react";
import AnimatedButton from "./AnimatedButton";
import posthog from "posthog-js";

interface ActionBarProps {
  onStartChat: (message: string) => void;
}

const ActionBar = ({ onStartChat }: ActionBarProps) => {
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

  return (
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
            onClick={() => startChat("Find out what the company Midpilot does")}
            className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
          >
            Find out what the company Midpilot does
          </button>
          <button
            onClick={() => startChat("Find the price of Bitcoin")}
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
              startChat("Give me an overview of the latest articles on Shifter.no")
            }
            className="p-3 text-sm text-black border border-black hover:border-black hover:text-black hover:bg-gray-50 transition-colors font-inter text-left rounded-md"
          >
            Give me an overview of the latest articles on Shifter.no
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
