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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  adminGetStats,
  createStat,
  updateStat,
  deleteStat,
  type Statistic,
} from "@/lib/api";
import { toast } from "sonner";

const AdminStats = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Statistic | null>(null);
  const [iconType, setIconType] = useState("Trophy");

  const { data: stats = [], isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminGetStats,
    retry: 1,
  });

  useEffect(() => {
    if (error) {
      console.error("Error loading stats:", error);
      toast.error("Ошибка загрузки статистики");
    }
  }, [error]);

  const createMutation = useMutation({
    mutationFn: createStat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      setIconType("Trophy");
      toast.success("Статистика добавлена");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при создании статистики");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Statistic> }) =>
      updateStat(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      setIconType("Trophy");
      toast.success("Статистика обновлена");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при обновлении статистики");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Статистика удалена");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при удалении статистики");
    },
  });

  useEffect(() => {
    if (editingItem) {
      setIconType(editingItem.icon_type || "Trophy");
    } else {
      setIconType("Trophy");
    }
  }, [editingItem, isDialogOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      value: formData.get("value") as string,
      label: formData.get("label") as string,
      suffix: formData.get("suffix") as string || "",
      icon_type: iconType,
      order: parseInt(formData.get("order") as string) || 0,
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
        Ошибка загрузки статистики. Пожалуйста, обновите страницу.
      </div>
    );
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingItem(null);
          setIconType("Trophy");
        }
      }}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Редактировать статистику" : "Добавить статистику"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Значение</Label>
                  <Input id="value" name="value" defaultValue={editingItem?.value} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suffix">Суффикс</Label>
                  <Input id="suffix" name="suffix" defaultValue={editingItem?.suffix} placeholder="+, %, лет" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Подпись</Label>
                <Input id="label" name="label" defaultValue={editingItem?.label} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon_type">Тип иконки</Label>
                  <Select
                    value={iconType}
                    onValueChange={setIconType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trophy">Trophy</SelectItem>
                      <SelectItem value="Users">Users</SelectItem>
                      <SelectItem value="Award">Award</SelectItem>
                      <SelectItem value="Target">Target</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    type="hidden"
                    name="icon_type"
                    value={iconType}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Порядок</Label>
                  <Input id="order" name="order" type="number" defaultValue={editingItem?.order || 0} />
                </div>
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
          <h2 className="text-xl font-semibold">Статистика</h2>
          <Button 
            type="button" 
            onClick={() => {
              setEditingItem(null);
              setIconType("Trophy");
              setIsDialogOpen(true);
            }}
          >
            Добавить статистику
          </Button>
        </div>

        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Значение</TableHead>
            <TableHead>Подпись</TableHead>
            <TableHead>Суффикс</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Статистика не добавлена
              </TableCell>
            </TableRow>
          ) : (
            stats.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.value}</TableCell>
              <TableCell>{item.label}</TableCell>
              <TableCell>{item.suffix || ""}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { 
                      setEditingItem(item); 
                      setIconType(item.icon_type || "Trophy");
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
                        <AlertDialogTitle>Удалить статистику?</AlertDialogTitle>
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

export default AdminStats;

