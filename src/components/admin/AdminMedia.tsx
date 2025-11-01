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
  adminGetMedia,
  createMedia,
  updateMedia,
  deleteMedia,
  uploadPhoto,
  type Media,
} from "@/lib/api";
import { toast } from "sonner";
import { resolveAssetUrl } from "@/lib/assets";

const AdminMedia = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Media | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media_type: "photo" as "photo" | "video",
    category: "",
    event_date: "",
    order: 0,
    is_active: true,
  });
  const [isUploading, setIsUploading] = useState(false);

  const { data: media = [], isLoading, error } = useQuery({
    queryKey: ["admin-media"],
    queryFn: adminGetMedia,
    retry: 1,
  });

  useEffect(() => {
    if (error) {
      console.error("Error loading media:", error);
      toast.error("Ошибка загрузки медиа");
    }
  }, [error]);

  const createMutation = useMutation({
    mutationFn: createMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Медиа добавлено");
    },
    onError: (error: Error) => {
      setIsUploading(false);
      toast.error(error.message || "Ошибка при создании медиа");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Media> }) =>
      updateMedia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Медиа обновлено");
    },
    onError: (error: Error) => {
      setIsUploading(false);
      toast.error(error.message || "Ошибка при обновлении медиа");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      toast.success("Медиа удалено");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при удалении медиа");
    },
  });

  const resetForm = () => {
    setEditingItem(null);
    setFile(null);
    setFilePreview("");
    setFormData({
      title: "",
      description: "",
      media_type: "photo",
      category: "",
      event_date: "",
      order: 0,
      is_active: true,
    });
    setIsUploading(false);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Media) => {
    setEditingItem(item);
    setFilePreview(resolveAssetUrl(item.file_path) || "");
    setFile(null);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      media_type: item.media_type || "photo",
      category: item.category || "",
      event_date: item.event_date ? item.event_date.split("T")[0] : "",
      order: item.order || 0,
      is_active: item.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isUploading || createMutation.isPending || updateMutation.isPending) {
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Заполните название");
      return;
    }

    let filePath = editingItem?.file_path || "";

    if (file) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadPhoto(file);
        filePath = uploadResult.url;
        setIsUploading(false);
      } catch (error: unknown) {
        setIsUploading(false);
        const errorMessage = error instanceof Error ? error.message : "Ошибка при загрузке файла";
        toast.error(errorMessage);
        return;
      }
    }

    if (!filePath && !editingItem) {
      toast.error("Выберите файл");
      return;
    }

    const data = {
      title: formData.title.trim(),
      description: formData.description.trim() || "",
      file_path: filePath,
      media_type: formData.media_type,
      category: formData.category.trim() || "general",
      event_date: formData.event_date || undefined,
      order: formData.order || 0,
      is_active: formData.is_active,
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
        Ошибка загрузки медиа. Пожалуйста, обновите страницу.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Медиа-галерея</h2>
        <Button onClick={handleAdd}>Добавить</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Превью</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead>Порядок</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {media.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Медиа не добавлено
              </TableCell>
            </TableRow>
          ) : (
            media.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.media_type === "photo" ? (
                    <img
                      src={resolveAssetUrl(item.file_path)}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      Video
                    </div>
                  )}
                </TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.media_type === "photo" ? "Фото" : "Видео"}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.event_date ? new Date(item.event_date).toLocaleDateString("ru-RU") : "-"}</TableCell>
                <TableCell>{item.order}</TableCell>
                <TableCell>{item.is_active ? "Активно" : "Неактивно"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
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
                          <AlertDialogTitle>Удалить медиа?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(item.id)}
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

      <Dialog 
        key={`dialog-${isDialogOpen ? 'open' : 'closed'}-${editingItem?.id || 'new'}`}
        open={isDialogOpen} 
        onOpenChange={(open) => {
          console.log("AdminMedia Dialog onOpenChange:", open);
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Редактировать медиа" : "Добавить медиа"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Файл</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  disabled={!!editingItem && !file}
                />
                {filePreview && (
                  <div className="mt-2">
                    {formData.media_type === "photo" ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="max-w-xs max-h-48 object-contain rounded"
                      />
                    ) : (
                      <video
                        src={filePreview}
                        className="max-w-xs max-h-48 rounded"
                        controls
                      />
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="title">Название *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="media_type">Тип</Label>
                  <Select
                    value={formData.media_type}
                    onValueChange={(value: "photo" | "video") =>
                      setFormData({ ...formData, media_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photo">Фото</SelectItem>
                      <SelectItem value="video">Видео</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="general"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_date">Дата события</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData({ ...formData, event_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="order">Порядок</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                  Активно
                </Label>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isUploading || createMutation.isPending || updateMutation.isPending}
              >
                {isUploading
                  ? "Загрузка..."
                  : editingItem
                  ? "Сохранить"
                  : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMedia;

