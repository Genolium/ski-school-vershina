import { useState, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
import { getApplications, updateApplication, deleteApplication, type Application } from "@/lib/api";
import { useAuthErrorHandler } from "@/hooks/useAuthErrorHandler";
import { toast } from "sonner";

const AdminApplications = () => {
  const queryClient = useQueryClient();
  const { handleAuthError } = useAuthErrorHandler();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Получение русского названия статуса
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: "Новые",
      contacted: "Связались",
      completed: "Завершены",
      cancelled: "Отменены",
    };
    return statusMap[status] || status;
  };

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: getApplications,
    retry: false,
    onError: handleAuthError,
  });

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = filterStatus === "all" || app.status === filterStatus;
      const matchesSearch = 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.phone.includes(searchQuery) ||
        (app.age && app.age.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.tariff && app.tariff.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [applications, filterStatus, searchQuery]);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateApplication(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast.success("Статус обновлен");
    },
    onError: (error: Error) => {
      handleAuthError(error);
      toast.error("Ошибка при обновлении статуса");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast.success("Заявка удалена");
    },
    onError: (error: Error) => {
      handleAuthError(error);
      toast.error("Ошибка при удалении заявки");
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    updateMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-sm sm:text-base">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Поиск по имени, телефону, тарифу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-full text-sm sm:text-base"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[200px] text-sm sm:text-base">
            <SelectValue placeholder="Фильтр по статусу" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все заявки</SelectItem>
            <SelectItem value="pending">Новые</SelectItem>
            <SelectItem value="contacted">Связались</SelectItem>
            <SelectItem value="completed">Завершены</SelectItem>
            <SelectItem value="cancelled">Отменены</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          Показано: {filteredApplications.length} из {applications.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">ID</TableHead>
              <TableHead className="text-xs sm:text-sm">Имя</TableHead>
              <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Телефон</TableHead>
              <TableHead className="text-xs sm:text-sm">Тариф</TableHead>
              <TableHead className="text-xs sm:text-sm">Статус</TableHead>
              <TableHead className="hidden md:table-cell text-xs sm:text-sm">Дата</TableHead>
              <TableHead className="text-xs sm:text-sm">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs sm:text-sm">
                  Заявки не найдены
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="text-xs sm:text-sm">{app.id}</TableCell>
              <TableCell className="text-xs sm:text-sm font-medium">{app.name}</TableCell>
              <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{app.phone}</TableCell>
              <TableCell className="text-xs sm:text-sm">{app.tariff || app.age || "-"}</TableCell>
              <TableCell>
                <Select
                  value={app.status}
                  onValueChange={(value) => handleStatusChange(app.id, value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
                    <SelectValue>{getStatusLabel(app.status)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Новые</SelectItem>
                    <SelectItem value="contacted">Связались</SelectItem>
                    <SelectItem value="completed">Завершены</SelectItem>
                    <SelectItem value="cancelled">Отменены</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                {new Date(app.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                      Удалить
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-sm sm:text-base">Удалить заявку?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs sm:text-sm">
                        Это действие нельзя отменить. Заявка будет удалена навсегда.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="text-xs sm:text-sm w-full sm:w-auto">Отмена</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(app.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminApplications;

