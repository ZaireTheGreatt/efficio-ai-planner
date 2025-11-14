-- Add admin policies for tasks table
CREATE POLICY "Admins can view all tasks"
ON public.tasks
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any task"
ON public.tasks
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add admin policies for profiles table
CREATE POLICY "Admins can delete any profile"
ON public.profiles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));