import { useState, useEffect } from "react";
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
  adminGetCoaches,
  createCoach,
  updateCoach,
  deleteCoach,
  uploadPhoto,
  type Coach,
} from "@/lib/api";
import { toast } from "sonner";
import { resolveAssetUrl } from "@/lib/assets";

const AdminTrainers = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Coach | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    description: "",
    order: 0,
  });
  const [isUploading, setIsUploading] = useState(false);

  const { data: coaches = [], isLoading, error } = useQuery({
    queryKey: ["admin-coaches"],
    queryFn: adminGetCoaches,
    retry: 1,
  });

  useEffect(() => {
    if (error) {
      console.error("Error loading coaches:", error);
      toast.error("Ошибка загрузки тренеров");
    }
  }, [error]);

  const createMutation = useMutation({
    mutationFn: createCoach,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      setPhotoFile(null);
      setPhotoPreview("");
      setFormData({
        name: "",
        position: "",
        description: "",
        order: 0,
      });
      setIsUploading(false);
      toast.success("Тренер добавлен");
    },
    onError: (error: Error) => {
      setIsUploading(false);
      toast.error(error.message || "Ошибка при создании тренера");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Coach> }) =>
      updateCoach(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      setPhotoFile(null);
      setPhotoPreview("");
      setFormData({
        name: "",
        position: "",
        description: "",
        order: 0,
      });
      setIsUploading(false);
      toast.success("Тренер обновлен");
    },
    onError: (error: Error) => {
      setIsUploading(false);
      toast.error(error.message || "Ошибка при обновлении тренера");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoach,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
      toast.success("Тренер удален");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при удалении тренера");
    },
  });

  const handleAdd = () => {
    setEditingItem(null);
    setPhotoFile(null);
    setPhotoPreview("");
    setFormData({
      name: "",
      position: "",
      description: "",
      order: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (coach: Coach) => {
    setEditingItem(coach);
    setPhotoPreview(resolveAssetUrl(coach.photo) || "");
    setPhotoFile(null);
    setFormData({
      name: coach.name || "",
      position: coach.position || "",
      description: coach.description || "",
      order: coach.order || 0,
    });
    setIsDialogOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Проверка, что форма не отправляется во время загрузки или других операций
    if (isUploading || createMutation.isPending || updateMutation.isPending) {
      return;
    }

    // Валидация обязательных полей
    if (!formData.name.trim() || !formData.position.trim()) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    let photoUrl = editingItem?.photo || "";

    // Загрузка фото, если выбрано новое
    if (photoFile) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadPhoto(photoFile);
        photoUrl = uploadResult.url;
        setIsUploading(false);
      } catch (error: any) {
        setIsUploading(false);
        toast.error(error.message || "Ошибка при загрузке фото");
        return;
      }
    }

    const data = {
      name: formData.name.trim(),
      position: formData.position.trim(),
      description: formData.description.trim() || "",
      photo: photoUrl,
      order: formData.order || 0,
    };

    // Выполнение мутации после готовности
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
        Ошибка загрузки тренеров. Пожалуйста, обновите страницу.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isDialogOpen && (
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingItem(null);
              setPhotoFile(null);
              setPhotoPreview("");
              setFormData({
                name: "",
                position: "",
                description: "",
                order: 0,
              });
              setIsUploading(false);
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Редактировать тренера" : "Добавить тренера"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" key={editingItem?.id || "new"}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Позиция</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Фото</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                {photoPreview && (
                  <div className="mt-2">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                {editingItem?.photo && !photoPreview && (
                  <div className="mt-2">
                    <img
                      src={resolveAssetUrl(editingItem.photo)}
                      alt="Current"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Порядок</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isUploading}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUploading || createMutation.isPending || updateMutation.isPending || !formData.name.trim() || !formData.position.trim()}
                >
                  {isUploading ? "Загрузка фото..." : createMutation.isPending || updateMutation.isPending ? "Сохранение..." : editingItem ? "Сохранить" : "Добавить"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Тренерский состав</h2>
        <Button type="button" onClick={handleAdd}>
          Добавить тренера
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Фото</TableHead>
            <TableHead>Имя</TableHead>
            <TableHead>Позиция</TableHead>
            <TableHead>Порядок</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coaches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Тренеры не добавлены
              </TableCell>
            </TableRow>
          ) : (
            coaches.map((coach) => (
              <TableRow key={coach.id}>
                <TableCell>
                  {coach.photo ? (
                    <img
                      src={resolveAssetUrl(coach.photo)}
                      alt={coach.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs">
                      Нет фото
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{coach.name}</TableCell>
                <TableCell>{coach.position}</TableCell>
                <TableCell>{coach.order}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(coach)}
                    >
                      Редактировать
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Удалить
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить тренера?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие нельзя отменить. Тренер будет удален навсегда.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(coach.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
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
  );
};

export default AdminTrainers;

