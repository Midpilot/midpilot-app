"use client"

import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { CircleIcon } from "lucide-react"
import ActionBar from "./ActionBar"
import { useCallback } from "react"
import posthog from "posthog-js"

interface UserDashboardProps {
  onStartChat: (message: string) => void;
}

export default function UserDashboard({ onStartChat }: UserDashboardProps) {
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
      <ActionBar onStartChat={startChat} />

      {/* Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="justify-start">
            Ny kvartalsrapportering
          </Button>
        </CardContent>
      </Card>

      {/* Ongoing Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Ongoing tasks:</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex items-center gap-2">
              <CircleIcon className="h-3 w-3 fill-green-500 text-green-500" />
              <span className="font-medium">Find leads for accelerator program</span>
            </div>
            <span className="text-muted-foreground">
              Searching LinkedIn for fitting candidates to accelerator program...
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Previous Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Previous tasks:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <span className="font-medium">Stock price of Nvidia:</span>
            <span>2342 USD</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Draft sales email:</span>
            <span className="text-muted-foreground">Draft sent to Thomas sent to philip@m.com</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

