import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, File, Clock } from "lucide-react";
import { format } from "date-fns";
import type { Task } from "@/pages/Index";

type TaskDetailsDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary text-secondary-foreground",
  high: "bg-accent text-accent-foreground",
  urgent: "bg-destructive text-destructive-foreground",
};

const isImageFile = (filename: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

export const TaskDetailsDialog = ({ task, open, onOpenChange }: TaskDetailsDialogProps) => {
  if (!task) return null;

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
            <Badge className={priorityColors[task.priority]} variant="secondary">
              {task.priority}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {task.description && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
              <p className="text-foreground">{task.description}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Frequency: </span>
              <span className="capitalize text-foreground">{task.frequency}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{format(task.dueDate, "MMM d, yyyy")}</span>
              </div>
            )}
          </div>

          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-3">
                Attachments ({task.attachments.length})
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {task.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
                  >
                    {isImageFile(attachment.name) ? (
                      <div className="relative group">
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            onClick={() => handleDownload(attachment.url, attachment.name)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 flex flex-col items-center justify-center h-40 gap-2">
                        <File className="h-12 w-12 text-muted-foreground" />
                        <p className="text-xs text-center truncate w-full px-2 text-foreground">
                          {attachment.name}
                        </p>
                      </div>
                    )}
                    <div className="p-2 bg-muted/50 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDownload(attachment.url, attachment.name)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        <span className="text-xs truncate">{attachment.name}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
