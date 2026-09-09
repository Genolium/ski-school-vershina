import { useState } from "react";
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
import { type Location } from "@/lib/api";
import { toast } from "sonner";
import { ItemsArrayInput } from "./ItemsArrayInput";
import { parseSmartArray, serializeSmartArray } from "@/lib/arrayParser";

interface LocationFormProps {
  editingItem: Location | null;
  iconType: string;
  setIconType: (value: string) => void;
  onSubmit: (data: Partial<Location>) => void;
  onCancel: () => void;
}

export const LocationForm = ({
  editingItem,
  iconType,
  setIconType,
  onSubmit,
  onCancel,
}: LocationFormProps) => {
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
      features: serializeSmartArray(parseSmartArray((formData.get("features") as string) || "")),
      icon_type: iconType,
      latitude: latitude,
      longitude: longitude,
      route_url: formData.get("route_url") as string || "",
      order: parseInt(formData.get("order") as string) || 0,
    };

    onSubmit(data);
  };

  return (
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
        <ItemsArrayInput
          name="features"
          id="features"
          label="Особенности локации"
          defaultValue={editingItem?.features || "[]"}
          presets={[
            "Искусственный склон",
            "Современное оборудование",
            "Раздевалки",
            "Безопасные трассы",
            "Подъемники",
            "Прокат оборудования",
          ]}
        />
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
            <Select value={iconType} onValueChange={setIconType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MapPin">MapPin</SelectItem>
                <SelectItem value="Bike">Bike</SelectItem>
                <SelectItem value="Mountain">Mountain</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="icon_type" value={iconType} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Порядок</Label>
            <Input id="order" name="order" type="number" defaultValue={editingItem?.order || 0} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit">{editingItem ? "Сохранить" : "Добавить"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

