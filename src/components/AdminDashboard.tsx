import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, Users, ListTodo, Paperclip } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskDetailsDialog } from "./TaskDetailsDialog";
import type { Task } from "@/pages/Index";

type Profile = {
  id: string;
  email: string;
  created_at: string;
};

type TaskWithUser = Task & {
  user_email: string;
};

export const AdminDashboard = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<TaskWithUser[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) throw roleError;

      setIsAdmin(!!roleData);

      if (roleData) {
        await Promise.all([loadProfiles(), loadTasks()]);
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;
    setProfiles(profilesData || []);
  };

  const loadTasks = async () => {
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        *,
        profiles!tasks_user_id_fkey(email)
      `)
      .order("created_at", { ascending: false });

    if (tasksError) throw tasksError;
    
    const formattedTasks = tasksData?.map(task => ({
      ...task,
      user_email: task.profiles?.email || "Unknown",
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
    })) || [];
    
    setTasks(formattedTasks);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This will also delete all their tasks.")) {
      return;
    }

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      await loadProfiles();
      await loadTasks();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      
      await loadTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleViewTask = (task: TaskWithUser) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4" />
                  Tasks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        profiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">{profile.email}</TableCell>
                            <TableCell className="font-mono text-sm">{profile.id}</TableCell>
                            <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(profile.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Total users: {profiles.length}
                </p>
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No tasks found
                          </TableCell>
                        </TableRow>
                      ) : (
                        tasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{task.title}</span>
                                {task.attachments && task.attachments.length > 0 && (
                                  <Paperclip className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{task.user_email}</TableCell>
                            <TableCell>
                              <span className="capitalize text-sm">{task.priority}</span>
                            </TableCell>
                            <TableCell className="text-sm">
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                            </TableCell>
                            <TableCell>
                              <span className={`text-sm ${task.completed ? "text-green-600" : "text-muted-foreground"}`}>
                                {task.completed ? "Completed" : "Pending"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewTask(task)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Total tasks: {tasks.length}
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <TaskDetailsDialog
        task={selectedTask}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};
