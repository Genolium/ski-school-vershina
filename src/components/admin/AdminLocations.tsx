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
  adminGetLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  type Location,
} from "@/lib/api";
import { toast } from "sonner";

const AdminLocations = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Location | null>(null);
  const [iconType, setIconType] = useState("MapPin");

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: adminGetLocations,
  });

  const createMutation = useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      setIconType("MapPin");
      toast.success("Локация добавлена");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при создании локации");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Location> }) =>
      updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      setIconType("MapPin");
      toast.success("Локация обновлена");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при обновлении локации");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      toast.success("Локация удалена");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при удалении локации");
    },
  });

  useEffect(() => {
    if (editingItem) {
      setIconType(editingItem.icon_type || "MapPin");
    } else {
      setIconType("MapPin");
    }
  }, [editingItem, isDialogOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const latitudeStr = formData.get("latitude") as string;
    const longitudeStr = formData.get("longitude") as string;
    
    let latitude: number | undefined;
    let longitude: number | undefined;
    
    if (latitudeStr && latitudeStr.trim() !== "") {
      latitude = parseFloat(latitudeStr);
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        toast.error("Широта должна быть числом от -90 до 90");
        return;
      }
    }
    
    if (longitudeStr && longitudeStr.trim() !== "") {
      longitude = parseFloat(longitudeStr);
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        toast.error("Долгота должна быть числом от -180 до 180");
        return;
      }
    }
    
    const data = {
      title: formData.get("title") as string,
      address: formData.get("address") as string,
      description: formData.get("description") as string || "",
      features: formData.get("features") as string || "",
      icon_type: iconType,
      latitude: latitude,
      longitude: longitude,
      route_url: formData.get("route_url") as string || "",
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

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingItem(null);
          setIconType("MapPin");
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Редактировать локацию" : "Добавить локацию"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название</Label>
                  <Input id="title" name="title" defaultValue={editingItem?.title} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input id="address" name="address" defaultValue={editingItem?.address} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea id="description" name="description" defaultValue={editingItem?.description} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Особенности (JSON массив)</Label>
                <Textarea id="features" name="features" defaultValue={editingItem?.features} placeholder='["Особенность 1", "Особенность 2"]' />
              </div>
              <div className="space-y-2">
                <Label htmlFor="route_url">Ссылка "Как добраться"</Label>
                <Input 
                  id="route_url" 
                  name="route_url" 
                  type="url"
                  defaultValue={editingItem?.route_url || ""} 
                  placeholder="https://2gis.ru/spb/routeSearch/..."
                />
                <p className="text-xs text-muted-foreground">Ссылка на маршрут в 2ГИС или другом сервисе</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Широта (latitude)</Label>
                  <Input 
                    id="latitude" 
                    name="latitude" 
                    type="number" 
                    step="any"
                    defaultValue={editingItem?.latitude || ""} 
                    placeholder="59.9343"
                  />
                  <p className="text-xs text-muted-foreground">От -90 до 90. Пример: 59.9343</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Долгота (longitude)</Label>
                  <Input 
                    id="longitude" 
                    name="longitude" 
                    type="number" 
                    step="any"
                    defaultValue={editingItem?.longitude || ""} 
                    placeholder="30.3351"
                  />
                  <p className="text-xs text-muted-foreground">От -180 до 180. Пример: 30.3351</p>
                </div>
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
                      <SelectItem value="MapPin">MapPin</SelectItem>
                      <SelectItem value="Bike">Bike</SelectItem>
                      <SelectItem value="Mountain">Mountain</SelectItem>
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
          <h2 className="text-xl font-semibold">Локации</h2>
          <Button 
            type="button" 
            onClick={() => {
              setEditingItem(null);
              setIconType("MapPin");
              setIsDialogOpen(true);
            }}
          >
            Добавить локацию
          </Button>
        </div>

        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Адрес</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.address}</TableCell>
              <TableCell>{item.description?.substring(0, 50)}...</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { 
                      setEditingItem(item); 
                      setIconType(item.icon_type || "MapPin");
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
                        <AlertDialogTitle>Удалить локацию?</AlertDialogTitle>
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
          ))}
        </TableBody>
        </Table>
      </div>
    </>
  );
};

export default AdminLocations;

