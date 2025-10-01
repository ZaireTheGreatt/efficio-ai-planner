import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw } from "lucide-react";
import type { Task } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

type AIPriorityPanelProps = {
  tasks: Task[];
};

type Suggestion = {
  task: Task;
  reason: string;
  suggestedPriority: "urgent" | "high" | "medium" | "low";
};

export const AIPriorityPanel = ({ tasks }: AIPriorityPanelProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateSuggestions = () => {
    setIsLoading(true);
    
    // Simple AI logic for prioritization
    const newSuggestions: Suggestion[] = [];
    const incompleteTasks = tasks.filter(t => !t.completed);
    
    // Check for urgent tasks with near due dates
    const now = new Date();
    const urgentTasks = incompleteTasks.filter(task => {
      if (!task.dueDate) return false;
      const daysUntilDue = Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 2 && task.priority !== "urgent";
    });

    urgentTasks.forEach(task => {
      newSuggestions.push({
        task,
        reason: "Due date is approaching soon",
        suggestedPriority: "urgent",
      });
    });

    // Check for high priority tasks
    const highPriorityTasks = incompleteTasks.filter(task => {
      if (!task.dueDate) return false;
      const daysUntilDue = Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7 && daysUntilDue > 2 && task.priority === "low";
    });

    highPriorityTasks.forEach(task => {
      newSuggestions.push({
        task,
        reason: "Consider increasing priority - due within a week",
        suggestedPriority: "high",
      });
    });

    // Check for overdue tasks
    const overdueTasks = incompleteTasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate < now && task.priority !== "urgent";
    });

    overdueTasks.forEach(task => {
      newSuggestions.push({
        task,
        reason: "This task is overdue!",
        suggestedPriority: "urgent",
      });
    });

    // Frequency-based suggestions
    const dailyTasks = incompleteTasks.filter(task => 
      task.frequency === "daily" && task.priority === "low"
    );

    dailyTasks.slice(0, 2).forEach(task => {
      newSuggestions.push({
        task,
        reason: "Daily tasks should be prioritized to maintain routine",
        suggestedPriority: "medium",
      });
    });

    setSuggestions(newSuggestions.slice(0, 5));
    setIsLoading(false);

    if (newSuggestions.length === 0) {
      toast({
        title: "All Good!",
        description: "Your tasks are well prioritized",
      });
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Priority Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered suggestions to optimize your task priorities
            </p>
            <Button 
              onClick={generateSuggestions} 
              disabled={isLoading || tasks.length === 0}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Suggestions
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-border bg-card/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-foreground">
                      {suggestion.task.title}
                    </p>
                    <Badge 
                      variant="secondary"
                      className={
                        suggestion.suggestedPriority === "urgent"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-accent text-accent-foreground"
                      }
                    >
                      {suggestion.suggestedPriority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.reason}
                  </p>
                </div>
              ))}
            </div>
            <Button 
              onClick={generateSuggestions} 
              variant="outline" 
              className="w-full"
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
