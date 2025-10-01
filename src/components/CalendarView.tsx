import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import type { Task } from "@/pages/Index";

type CalendarViewProps = {
  tasks: Task[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
};

export const CalendarView = ({ tasks, selectedDate, onSelectDate }: CalendarViewProps) => {
  const tasksForSelectedDate = tasks.filter(
    (task) => task.dueDate && selectedDate && isSameDay(task.dueDate, selectedDate)
  );

  const taskDates = tasks
    .filter((task) => task.dueDate)
    .map((task) => task.dueDate as Date);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            className="rounded-md border"
            modifiers={{
              hasTask: taskDates,
            }}
            modifiersStyles={{
              hasTask: {
                fontWeight: "bold",
                textDecoration: "underline",
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <p className="text-muted-foreground text-center py-8">
              Select a date to view tasks
            </p>
          ) : tasksForSelectedDate.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tasks scheduled for this date
            </p>
          ) : (
            <div className="space-y-3">
              {tasksForSelectedDate.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{task.title}</h4>
                    <Badge
                      variant="secondary"
                      className={
                        task.priority === "urgent"
                          ? "bg-destructive text-destructive-foreground"
                          : task.priority === "high"
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
