"use client"

import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { CircleIcon, ArrowRight } from "lucide-react"
import ActionBar from "./ActionBar"
import { useCallback, useState, useEffect } from "react"
import posthog from "posthog-js"
import { BrowserSession } from "../api/operatorProvider"

interface UserDashboardProps {
  onStartChat: (message: string) => void;
}

interface TaskSession {
  id: string;
  message: string;
  session: BrowserSession | null;
}

export default function UserDashboard({ onStartChat }: UserDashboardProps) {
  const [activeTasks, setActiveTasks] = useState<TaskSession[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskSession[]>([]);

  // Subscribe to updates for active tasks using SSE
  useEffect(() => {
    const eventSources = activeTasks.map(task => {
      if (!task.id) return null;
      
      const eventSource = new EventSource(`/api/session/status?sessionId=${task.id}`);
      
      eventSource.onmessage = (event) => {
        try {
          const session: BrowserSession = JSON.parse(event.data);
          
          // Check if this is a finished/failed status
          const isComplete = session.status === "finished" || session.status === "failed";
          
          if (isComplete) {
            setActiveTasks(current => current.filter(t => t.id !== task.id));
            setCompletedTasks(current => [...current, { ...task, session }]);
            eventSource.close();
          } else {
            setActiveTasks(current => 
              current.map(t => t.id === task.id ? { ...t, session } : t)
            );
          }
        } catch (error) {
          console.error("Error parsing session data:", error);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };

      return eventSource;
    });

    return () => {
      eventSources.forEach(es => es?.close());
    };
  }, [activeTasks]);

  useEffect(() => {
    const loadInitialTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        
        if (data.success) {
          // Separate active and completed tasks
          const active: TaskSession[] = [];
          const completed: TaskSession[] = [];
          
          data.tasks.forEach((task: BrowserSession) => {
            const taskSession = {
              id: task.id,
              message: task.task,
              session: task
            };
            
            if (task.status === 'finished' || task.status === 'failed') {
              completed.push(taskSession);
            } else {
              active.push(taskSession);
            }
          });
          
          setActiveTasks(active);
          setCompletedTasks(completed);
        }
      } catch (error) {
        console.error('Error loading initial tasks:', error);
      }
    };

    loadInitialTasks();
  }, []);

  const startChat = useCallback(
    async (finalMessage: string) => {
      onStartChat(finalMessage);

      try {
        // Create a new session
        const sessionResponse = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            goal: finalMessage,
          }),
        });
        
        const sessionData = await sessionResponse.json();
        if (!sessionData.success) {
          throw new Error(sessionData.error || "Failed to create session");
        }

        // Add to active tasks
        setActiveTasks(current => [...current, {
          id: sessionData.sessionId,
          message: finalMessage,
          session: null
        }]);

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
            {activeTasks.map(task => (
              <button 
                key={task.id}
                className="w-full hover:bg-muted rounded-lg p-2 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <CircleIcon className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{task.message}</span>
                  </div>
                  <div className="text-muted-foreground flex justify-between items-center">
                    <div>
                      {task.session?.output || 'Starting...'}
                      {task.session?.steps.length > 0 && (
                        <div className="text-sm text-muted-foreground/80">
                          Step {task.session.steps.length}: {
                            task.session.steps[task.session.steps.length - 1].next_goal
                          }
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground/60 flex items-center gap-1">
                      Follow agent
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
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
            {completedTasks.map(task => (
              <button 
                key={task.id}
                className="w-full hover:bg-muted rounded-lg p-2 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <CircleIcon 
                      className={`h-3 w-3 ${
                        task.session?.status === 'failed' 
                          ? 'fill-red-500 text-red-500' 
                          : 'fill-green-500 text-green-500'
                      }`} 
                    />
                    <span className="font-medium">{task.message}</span>
                  </div>
                  <div className="text-muted-foreground flex justify-between items-center">
                    <div>{task.session?.output || 'No output available'}</div>
                    <div className="text-sm text-muted-foreground/60 flex items-center gap-1">
                      View details
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

