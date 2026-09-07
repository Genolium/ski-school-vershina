import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  adminGetLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  type Location,
} from "@/lib/api";
import { toast } from "sonner";
import { LocationForm } from "./LocationForm";
import { LocationTable } from "./LocationTable";

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

  const handleSubmit = (data: Partial<Location>) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      const newLocation: Omit<Location, "id"> = {
        title: data.title || "",
        address: data.address || "",
        description: data.description || "",
        features: data.features || JSON.stringify([]),
        icon_type: data.icon_type || iconType || "MapPin",
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,
        route_url: data.route_url || "",
        order: data.order ?? locations.length + 1,
      };
      createMutation.mutate(newLocation);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setIconType("MapPin");
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIconType("MapPin");
    setIsDialogOpen(true);
  };

  const handleEdit = (location: Location) => {
    setEditingItem(location);
    setIconType(location.icon_type || "MapPin");
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <>
      <Dialog 
        key={`dialog-${isDialogOpen ? 'open' : 'closed'}-${editingItem?.id || 'new'}`}
        open={isDialogOpen} 
        onOpenChange={(open) => {
          console.log("AdminLocations Dialog onOpenChange:", open);
          setIsDialogOpen(open);
        }}
      >
        <LocationForm
          editingItem={editingItem}
          iconType={iconType}
          setIconType={setIconType}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Dialog>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Локации</h2>
          <Button type="button" onClick={handleAdd}>
            Добавить локацию
          </Button>
        </div>

        <LocationTable
          locations={locations}
          onEdit={handleEdit}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </div>
    </>
  );
};

export default AdminLocations;

