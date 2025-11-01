import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  adminGetCamps,
  createCamp,
  updateCamp,
  deleteCamp,
  type Camp,
} from "@/lib/api";
import { toast } from "sonner";

const AdminCamps = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Camp | null>(null);

  const { data: camps = [], isLoading, error } = useQuery({
    queryKey: ["admin-camps"],
    queryFn: adminGetCamps,
    retry: 1,
  });

  useEffect(() => {
    if (error) {
      console.error("Error loading camps:", error);
      toast.error("Ошибка загрузки сборов");
    }
  }, [error]);

  const createMutation = useMutation({
    mutationFn: createCamp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-camps"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("Сборы добавлены");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при создании сборов");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Camp> }) =>
      updateCamp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-camps"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("Сборы обновлены");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при обновлении сборов");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCamp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-camps"] });
      toast.success("Сборы удалены");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при удалении сборов");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      location: formData.get("location") as string,
      location_desc: formData.get("location_desc") as string || "",
      dates: formData.get("dates") as string,
      duration: formData.get("duration") as string || "",
      group_size: formData.get("group_size") as string || "",
      group_desc: formData.get("group_desc") as string || "",
      training_desc: formData.get("training_desc") as string || "",
      included_items: formData.get("included_items") as string || "",
      stats: formData.get("stats") as string || "",
      is_active: formData.get("is_active") === "on",
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Ошибка загрузки сборов. Пожалуйста, обновите страницу.
      </div>
    );
  }

  return (
    <>
      <Dialog 
        key={`dialog-${isDialogOpen ? 'open' : 'closed'}-${editingItem?.id || 'new'}`}
        open={isDialogOpen} 
        onOpenChange={(open) => {
          console.log("AdminCamps Dialog onOpenChange:", open);
          setIsDialogOpen(open);
          if (!open) {
            setEditingItem(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Редактировать сборы" : "Добавить сборы"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название</Label>
                  <Input id="title" name="title" defaultValue={editingItem?.title} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Локация</Label>
                  <Input id="location" name="location" defaultValue={editingItem?.location} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_desc">Описание локации</Label>
                <Input id="location_desc" name="location_desc" defaultValue={editingItem?.location_desc} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dates">Даты</Label>
                  <Input id="dates" name="dates" defaultValue={editingItem?.dates} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Продолжительность</Label>
                  <Input id="duration" name="duration" defaultValue={editingItem?.duration} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group_size">Размер группы</Label>
                  <Input id="group_size" name="group_size" defaultValue={editingItem?.group_size} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group_desc">Описание группы</Label>
                  <Input id="group_desc" name="group_desc" defaultValue={editingItem?.group_desc} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="training_desc">Описание тренировок</Label>
                <Textarea id="training_desc" name="training_desc" defaultValue={editingItem?.training_desc} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="included_items">Включено (JSON массив)</Label>
                <Textarea id="included_items" name="included_items" defaultValue={editingItem?.included_items} placeholder='["Проживание", "Питание"]' />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stats">Статистика (JSON объект)</Label>
                <Textarea id="stats" name="stats" defaultValue={editingItem?.stats} placeholder='{"camps_count": "5", "participants": "80+"}' />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="is_active" name="is_active" defaultChecked={editingItem?.is_active !== false} />
                <Label htmlFor="is_active">Активны</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">{editingItem ? "Сохранить" : "Добавить"}</Button>
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Сборы</h2>
          <Button 
            type="button" 
            onClick={() => {
              setEditingItem(null);
              setIsDialogOpen(true);
            }}
          >
            Добавить сборы
          </Button>
        </div>

        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Локация</TableHead>
            <TableHead>Даты</TableHead>
            <TableHead>Активны</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {camps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Сборы не добавлены
              </TableCell>
            </TableRow>
          ) : (
            camps.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell>{item.dates}</TableCell>
              <TableCell>{item.is_active ? "Да" : "Нет"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { 
                      setEditingItem(item);
                      setIsDialogOpen(true);
                    }}
                  >
                    Редактировать
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Удалить</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить сборы?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие нельзя отменить.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(item.id)} className="bg-destructive">
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
            ))
          )}
        </TableBody>
        </Table>
      </div>
    </>
  );
};

export default AdminCamps;

