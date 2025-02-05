"use client"

import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { CircleIcon, ArrowRight } from "lucide-react"
import ActionBar from "./ActionBar"
import { useCallback, useState, useEffect } from "react"
import posthog from "posthog-js"

interface UserDashboardProps {
  onStartChat: (message: string) => void;
}

export default function UserDashboard({ onStartChat }: UserDashboardProps) {
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);
  const [dots, setDots] = useState('');

  const statusUpdates = [
    "Searching LinkedIn for fitting candidates to accelerator program",
    "Found 15 potential candidates matching the criteria",
    "Analyzing profiles for startup experience",
    "Filtering candidates based on technical background",
    "Preparing final list of top candidates"
  ];

  useEffect(() => {
    setDots('.'); // Reset dots when message changes
    
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);

    const messageInterval = setInterval(() => {
      setCurrentUpdateIndex((prev) => (prev + 1) % statusUpdates.length);
    }, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(messageInterval);
    };
  }, [currentUpdateIndex, statusUpdates.length]); // Added statusUpdates.length to dependencies

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
    <div>
      <div className="mb-4">
        <ActionBar onStartChat={startChat} />
      </div>

      {/* Shortcuts */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Repeatable tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="justify-start">
            Ny kvartalsrapportering
          </Button>
        </CardContent>
      </Card>

      {/* Ongoing Tasks */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Tasks we&apos;re working on right now:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <button 
              className="w-full hover:bg-muted rounded-lg p-2 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <CircleIcon className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span className="font-medium">Find leads for accelerator program</span>
                </div>
                <div className="text-muted-foreground flex justify-between items-center">
                  <div>
                    {statusUpdates[currentUpdateIndex]}
                    {' '}
                    <span className="inline-block w-[24px] text-left">
                      {dots}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground/60 flex items-center gap-1">
                    Follow agent
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Previous Tasks */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Completed tasks:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <button 
              className="w-full hover:bg-muted rounded-lg p-2 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <CircleIcon className="h-3 w-3 fill-green-500 text-green-500" />
                  <span className="font-medium">Find the stock price of Nvidia</span>
                </div>
                <div className="text-muted-foreground flex justify-between items-center">
                  <div>2342 USD</div>
                  <div className="text-sm text-muted-foreground/60 flex items-center gap-1">
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </button>

            <button 
              className="w-full hover:bg-muted rounded-lg p-2 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <CircleIcon className="h-3 w-3 fill-green-500 text-green-500" />
                  <span className="font-medium">Draft sales email</span>
                </div>
                <div className="text-muted-foreground flex justify-between items-center">
                  <div>Draft to Thomas sent to philip@m.com</div>
                  <div className="text-sm text-muted-foreground/60 flex items-center gap-1">
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

