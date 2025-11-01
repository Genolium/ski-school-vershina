import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminGetAbout, updateAbout } from "@/lib/api";
import { toast } from "sonner";

const AdminAbout = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data: about, isLoading, error } = useQuery({
    queryKey: ["admin-about"],
    queryFn: adminGetAbout,
    retry: 1,
  });

  useEffect(() => {
    if (error) {
      console.error("Error loading about:", error);
      toast.error("Ошибка загрузки информации");
    }
  }, [error]);

  useEffect(() => {
    if (about) {
      setTitle(about.title || "");
      setDescription(about.description || "");
    }
  }, [about]);

  const updateMutation = useMutation({
    mutationFn: (data: { title: string; description: string }) =>
      updateAbout(about?.id || 1, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about"] });
      toast.success("Сохранено");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при сохранении");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateMutation.mutate({ title, description });
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Ошибка загрузки информации. Пожалуйста, обновите страницу.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>О нас</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
              required
            />
          </div>
          <Button type="submit">Сохранить</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminAbout;

