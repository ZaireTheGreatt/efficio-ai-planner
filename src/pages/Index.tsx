import { useState } from "react";
import { TaskInput } from "@/components/TaskInput";
import { TaskList } from "@/components/TaskList";
import { CalendarView } from "@/components/CalendarView";
import { AIPriorityPanel } from "@/components/AIPriorityPanel";
import { CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
};

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleAddTask = (task: Omit<Task, "id" | "completed" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      completed: false,
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Efficio</h1>
              <p className="text-sm text-muted-foreground">Smart Task Manager with AI Assistance</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task Input & AI Panel */}
          <div className="space-y-6">
            <TaskInput onAddTask={handleAddTask} />
            <AIPriorityPanel tasks={tasks} />
          </div>

          {/* Middle & Right Column - Tasks & Calendar */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Task List</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="mt-6">
                <TaskList 
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                />
              </TabsContent>
              <TabsContent value="calendar" className="mt-6">
                <CalendarView 
                  tasks={tasks}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
