import { useState, useMemo, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { getApplications, updateApplication, deleteApplication, type Application } from "@/lib/api";
import { useAuthErrorHandler } from "@/hooks/useAuthErrorHandler";
import { toast } from "sonner";
import { Phone, MessageCircle, Download, Search, X, Trash2, CheckCircle, Clock, CheckCheck, XCircle } from "lucide-react";

const AdminApplications = () => {
  const queryClient = useQueryClient();
  const { handleAuthError } = useAuthErrorHandler();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      try {
        return await getApplications();
      } catch (err) {
        handleAuthError(err);
        throw err;
      }
    },
    retry: false,
  });

  const counts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter((a) => a.status === "pending").length,
      contacted: applications.filter((a) => a.status === "contacted").length,
      completed: applications.filter((a) => a.status === "completed").length,
      cancelled: applications.filter((a) => a.status === "cancelled").length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = filterStatus === "all" || app.status === filterStatus;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesStatus;

      const matchesSearch =
        (app.name && app.name.toLowerCase().includes(query)) ||
        (app.phone && app.phone.includes(query)) ||
        (app.age && app.age.toLowerCase().includes(query)) ||
        (app.tariff && app.tariff.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [applications, filterStatus, searchQuery]);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateApplication(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast.success("Статус заявки обновлен");
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
      toast.success("Заявка успешно удалена");
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

  // Экспорт заявок в CSV (с UTF-8 BOM для корректного открытия в Excel на русском)
  const exportToCSV = useCallback(() => {
    if (applications.length === 0) {
      toast.error("Нет заявок для экспорта");
      return;
    }

    const headers = ["ID", "Имя", "Телефон", "Тариф/Возраст", "Статус", "Дата создания"];
    const statusMap: Record<string, string> = {
      pending: "Новая",
      contacted: "Связались",
      completed: "Завершена",
      cancelled: "Отменена",
    };

    const rows = filteredApplications.map((app) => [
      app.id,
      `"${(app.name || "").replace(/"/g, '""')}"`,
      `"${app.phone}"`,
      `"${app.tariff || app.age || "-"}"`,
      `"${statusMap[app.status] || app.status}"`,
      `"${new Date(app.created_at).toLocaleString("ru-RU")}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `zayavki_vershina_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Файл успешно экспортирован");
  }, [applications.length, filteredApplications]);

  const cleanPhoneForWhatsApp = (phone: string): string => {
    let clean = phone.replace(/[^\d]/g, "");
    if (clean.startsWith("8") && clean.length === 11) {
      clean = "7" + clean.slice(1);
    }
    return clean;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 gap-1 font-medium">
            <Clock className="w-3 h-3 text-amber-500 animate-pulse" /> Новая
          </Badge>
        );
      case "contacted":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 gap-1 font-medium">
            <CheckCircle className="w-3 h-3 text-blue-500" /> Связались
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 font-medium">
            <CheckCheck className="w-3 h-3 text-emerald-500" /> Завершена
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 gap-1 font-medium">
            <XCircle className="w-3 h-3 text-gray-400" /> Отменена
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Загрузка заявок...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Верхние информационные чипсы */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`p-3 rounded-lg border text-left transition-all ${
            filterStatus === "all"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card hover:bg-muted border-border text-foreground"
          }`}
        >
          <div className="text-xs font-medium opacity-80">Всего заявок</div>
          <div className="text-xl font-bold mt-0.5">{counts.all}</div>
        </button>

        <button
          onClick={() => setFilterStatus("pending")}
          className={`p-3 rounded-lg border text-left transition-all ${
            filterStatus === "pending"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
              : "bg-card hover:bg-amber-50/50 border-border text-foreground"
          }`}
        >
          <div className="text-xs font-medium text-amber-600 flex items-center justify-between">
            <span>Новые</span>
            {counts.pending > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
          <div className="text-xl font-bold mt-0.5 text-amber-700">{counts.pending}</div>
        </button>

        <button
          onClick={() => setFilterStatus("contacted")}
          className={`p-3 rounded-lg border text-left transition-all ${
            filterStatus === "contacted"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-card hover:bg-blue-50/50 border-border text-foreground"
          }`}
        >
          <div className="text-xs font-medium text-blue-600">Связались</div>
          <div className="text-xl font-bold mt-0.5 text-blue-700">{counts.contacted}</div>
        </button>

        <button
          onClick={() => setFilterStatus("completed")}
          className={`p-3 rounded-lg border text-left transition-all ${
            filterStatus === "completed"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-card hover:bg-emerald-50/50 border-border text-foreground"
          }`}
        >
          <div className="text-xs font-medium text-emerald-600">Завершены</div>
          <div className="text-xl font-bold mt-0.5 text-emerald-700">{counts.completed}</div>
        </button>

        <button
          onClick={() => setFilterStatus("cancelled")}
          className={`p-3 rounded-lg border text-left transition-all col-span-2 sm:col-span-1 ${
            filterStatus === "cancelled"
              ? "bg-gray-700 text-white border-gray-700 shadow-sm"
              : "bg-card hover:bg-gray-100 border-border text-foreground"
          }`}
        >
          <div className="text-xs font-medium text-gray-500">Отменены</div>
          <div className="text-xl font-bold mt-0.5 text-gray-600">{counts.cancelled}</div>
        </button>
      </div>

      {/* Панель поиска и экспорта */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени, телефону, тарифу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="gap-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-primary" />
            Экспорт в Excel (CSV)
          </Button>
          <span className="text-xs text-muted-foreground hidden md:inline">
            Найдено: <b>{filteredApplications.length}</b>
          </span>
        </div>
      </div>

      {/* Таблица заявок */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[60px] text-xs font-semibold">ID</TableHead>
                <TableHead className="text-xs font-semibold">Клиент</TableHead>
                <TableHead className="text-xs font-semibold">Телефон / Связь</TableHead>
                <TableHead className="text-xs font-semibold">Тариф</TableHead>
                <TableHead className="text-xs font-semibold">Статус</TableHead>
                <TableHead className="text-xs font-semibold">Дата</TableHead>
                <TableHead className="w-[80px] text-xs font-semibold text-right">Удалить</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <div className="text-base font-medium">Заявки не найдены</div>
                    <div className="text-xs mt-1">Попробуйте изменить фильтр или поисковый запрос</div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => {
                  const cleanPhone = cleanPhoneForWhatsApp(app.phone);
                  return (
                    <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-xs font-mono text-muted-foreground">#{app.id}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm text-foreground">{app.name}</div>
                        {app.age && <div className="text-xs text-muted-foreground">Возраст: {app.age}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${app.phone}`}
                            className="text-xs sm:text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                            title="Позвонить"
                          >
                            <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{app.phone}</span>
                          </a>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                `Здравствуйте, ${app.name}! Горнолыжная школа «Вершина». Вы оставляли заявку на нашем сайте.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                              title="Написать в WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs sm:text-sm font-medium px-2 py-1 rounded bg-muted">
                          {app.tariff || app.age || "Не указан"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(app.status)}
                          <Select
                            value={app.status}
                            onValueChange={(val) => handleStatusChange(app.id, val)}
                          >
                            <SelectTrigger className="h-7 w-7 p-0 border-dashed" title="Изменить статус">
                              <span className="sr-only">Изменить</span>
                            </SelectTrigger>
                            <SelectContent align="end">
                              <SelectItem value="pending">Новая</SelectItem>
                              <SelectItem value="contacted">Связались</SelectItem>
                              <SelectItem value="completed">Завершена</SelectItem>
                              <SelectItem value="cancelled">Отменена</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(app.created_at).toLocaleString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить заявку #{app.id}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Вы действительно хотите удалить заявку от <b>{app.name}</b> ({app.phone})? Это действие нельзя отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(app.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminApplications;
