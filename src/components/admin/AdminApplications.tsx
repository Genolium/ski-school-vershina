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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getApplications,
  updateApplication,
  deleteApplication,
  type Application,
} from "@/lib/api";
import { useAuthErrorHandler } from "@/hooks/useAuthErrorHandler";
import { toast } from "sonner";
import {
  Phone,
  MessageCircle,
  Download,
  Search,
  X,
  Trash2,
  CheckCircle,
  Clock,
  CheckCheck,
  XCircle,
  ShieldCheck,
  TrendingUp,
  Eye,
  Filter,
} from "lucide-react";

/**
 * Format marketing source key into a human-friendly readable badge title.
 */
export const formatMarketingSource = (source?: string, medium?: string): string => {
  if (!source) return "Прямой заход";
  const s = source.toLowerCase().trim();
  const m = (medium || "").toLowerCase().trim();

  if (s.includes("yandex") || s === "direct" || s === "ya") {
    return m === "cpc" || m === "direct" ? "Яндекс.Директ" : "Яндекс";
  }
  if (s.includes("vk") || s.includes("vkontakte")) {
    return "VK";
  }
  if (s.includes("google") || s.includes("adwords")) {
    return m === "cpc" ? "Google Ads" : "Google";
  }
  if (s.includes("tg") || s.includes("telegram")) {
    return "Telegram";
  }
  if (s.includes("avito")) return "Авито";
  if (s.includes("dzen")) return "Дзен";
  if (s.includes("mytarget")) return "MyTarget";

  // Capitalize custom source
  return source.charAt(0).toUpperCase() + source.slice(1);
};

/**
 * Safe date formatter that will never crash or output "Invalid Date".
 */
export const formatDateSafe = (dateStr?: string): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const AdminApplications = () => {
  const queryClient = useQueryClient();
  const { handleAuthError } = useAuthErrorHandler();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

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

  // Extract distinct UTM sources present across all applications
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((app) => {
      if (app.utm_source && app.utm_source.trim()) {
        set.add(app.utm_source.trim().toLowerCase());
      }
    });
    return Array.from(set).sort();
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = filterStatus === "all" || app.status === filterStatus;

      // Channel / source filtering
      let matchesChannel = true;
      const hasUtm = Boolean(app.utm_source || app.utm_campaign);
      if (filterChannel === "utm") {
        matchesChannel = hasUtm;
      } else if (filterChannel === "direct") {
        matchesChannel = !hasUtm;
      } else if (filterChannel !== "all") {
        matchesChannel =
          (app.utm_source || "").trim().toLowerCase() === filterChannel.toLowerCase();
      }

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesStatus && matchesChannel;

      const matchesSearch =
        (app.name && app.name.toLowerCase().includes(query)) ||
        (app.phone && app.phone.includes(query)) ||
        (app.age && app.age.toLowerCase().includes(query)) ||
        (app.tariff && app.tariff.toLowerCase().includes(query)) ||
        (app.utm_source && app.utm_source.toLowerCase().includes(query)) ||
        (app.utm_campaign && app.utm_campaign.toLowerCase().includes(query)) ||
        (app.utm_medium && app.utm_medium.toLowerCase().includes(query)) ||
        (app.utm_content && app.utm_content.toLowerCase().includes(query)) ||
        (app.utm_term && app.utm_term.toLowerCase().includes(query)) ||
        (app.client_ip && app.client_ip.toLowerCase().includes(query));

      return matchesStatus && matchesChannel && matchesSearch;
    });
  }, [applications, filterStatus, filterChannel, searchQuery]);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateApplication(id, status),
    onMutate: ({ id, status }) => {
      queryClient.cancelQueries({ queryKey: ["admin-applications"] });
      const previousApplications = queryClient.getQueryData<Application[]>([
        "admin-applications",
      ]);
      queryClient.setQueryData<Application[]>(["admin-applications"], (old) => {
        if (!old) return [];
        return old.map((app) =>
          app.id === id ? { ...app, status: status as Application["status"] } : app
        );
      });
      return { previousApplications };
    },
    onSuccess: () => {
      toast.success("Статус заявки обновлен");
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousApplications) {
        queryClient.setQueryData(["admin-applications"], context.previousApplications);
      }
      handleAuthError(error);
      toast.error("Ошибка обновления");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onMutate: (id: number) => {
      queryClient.cancelQueries({ queryKey: ["admin-applications"] });
      const previousApplications = queryClient.getQueryData<Application[]>([
        "admin-applications",
      ]);
      queryClient.setQueryData<Application[]>(["admin-applications"], (old) => {
        if (!old) return [];
        return old.filter((app) => app.id !== id);
      });
      return { previousApplications };
    },
    onSuccess: () => {
      toast.success("Заявка успешно удалена");
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousApplications) {
        queryClient.setQueryData(["admin-applications"], context.previousApplications);
      }
      handleAuthError(error);
      toast.error("Ошибка при удалении заявки");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    updateMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  // Safe string sanitizer for Excel/CSV cell content: replaces line breaks with spaces and escapes double quotes
  const sanitizeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/[\r\n]+/g, " ").trim();
    return `"${str.replace(/"/g, '""')}"`;
  };

  // Formats phone numbers as Excel text formula: ="phone" to avoid formula calculation, scientific notation, or #NAME? errors
  const formatExcelPhone = (phone: string): string => {
    const sanitized = (phone || "").replace(/[\r\n]+/g, " ").trim();
    if (!sanitized) return '""';
    return `"=""${sanitized.replace(/"/g, '""')}"""`;
  };

  // Экспорт заявок в CSV (с UTF-8 BOM и разделителем ; для корректного открытия в Excel на русском)
  const exportToCSV = useCallback(() => {
    if (applications.length === 0) {
      toast.error("Нет заявок для экспорта");
      return;
    }

    const headers = [
      "ID",
      "Имя",
      "Телефон",
      "Тариф / Направление",
      "Статус",
      "Дата создания",
      "Источник (UTM Source)",
      "Кампания (UTM Campaign)",
      "Канал (UTM Medium)",
      "Согласие 152-ФЗ",
      "Дата согласия",
      "IP адрес",
    ];

    const statusMap: Record<string, string> = {
      pending: "Новая",
      contacted: "Связались",
      completed: "Завершена",
      cancelled: "Отменена",
    };

    const rows = filteredApplications.map((app) => [
      app.id,
      sanitizeCsv(app.name),
      formatExcelPhone(app.phone),
      sanitizeCsv(app.tariff || app.age || "Не указан"),
      sanitizeCsv(statusMap[app.status] || app.status),
      sanitizeCsv(formatDateSafe(app.created_at)),
      sanitizeCsv(app.utm_source || "Прямой заход"),
      sanitizeCsv(app.utm_campaign || "-"),
      sanitizeCsv(app.utm_medium || "-"),
      sanitizeCsv(app.consent_given !== false ? "Подтверждено" : "Нет"),
      sanitizeCsv(formatDateSafe(app.consent_timestamp || app.created_at)),
      sanitizeCsv(app.client_ip || "-"),
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
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
    toast.success("Файл успешно экспортирован в CSV / Excel");
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
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-300 gap-1 font-medium dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
          >
            <Clock className="w-3 h-3 text-amber-500 animate-pulse" /> Новая
          </Badge>
        );
      case "contacted":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-300 gap-1 font-medium dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
          >
            <CheckCircle className="w-3 h-3 text-blue-500" /> Связались
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 font-medium dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          >
            <CheckCheck className="w-3 h-3 text-emerald-500" /> Завершена
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-600 border-gray-300 gap-1 font-medium dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          >
            <XCircle className="w-3 h-3 text-gray-400" /> Отменена
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  /**
   * Render rich UTM marketing source & campaign badge with tooltip
   */
  const renderUTMBadge = (app: Application) => {
    if (!app.utm_source && !app.utm_campaign) {
      return (
        <span className="text-xs text-muted-foreground font-normal">
          Прямой заход
        </span>
      );
    }

    const sourceName = formatMarketingSource(app.utm_source, app.utm_medium);
    const sourceLower = (app.utm_source || "").toLowerCase();

    let badgeClass =
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
    if (sourceLower.includes("yandex") || sourceLower === "direct" || sourceLower === "ya") {
      badgeClass =
        "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    } else if (sourceLower.includes("vk")) {
      badgeClass =
        "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
    } else if (sourceLower.includes("google")) {
      badgeClass =
        "bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800";
    } else if (sourceLower.includes("tg") || sourceLower.includes("telegram")) {
      badgeClass =
        "bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800";
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-0.5 items-start cursor-help">
            <Badge
              variant="outline"
              className={`${badgeClass} font-medium gap-1 text-[11px] hover:opacity-90 transition-opacity`}
            >
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span>{sourceName}</span>
            </Badge>
            {app.utm_campaign && (
              <span
                className="text-[11px] text-muted-foreground truncate max-w-[140px] block"
                title={`Кампания: ${app.utm_campaign}`}
              >
                {app.utm_campaign}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3 space-y-1.5 text-xs z-50">
          <p className="font-semibold border-b pb-1 text-foreground">
            Маркетинговые данные (UTM)
          </p>
          <p>
            <span className="text-muted-foreground">Источник (utm_source):</span>{" "}
            <b className="text-foreground">{app.utm_source || "Прямой заход"}</b>
          </p>
          {app.utm_campaign && (
            <p>
              <span className="text-muted-foreground">Кампания (utm_campaign):</span>{" "}
              <b className="text-foreground">{app.utm_campaign}</b>
            </p>
          )}
          {app.utm_medium && (
            <p>
              <span className="text-muted-foreground">Канал (utm_medium):</span>{" "}
              <b className="text-foreground">{app.utm_medium}</b>
            </p>
          )}
          {app.utm_content && (
            <p>
              <span className="text-muted-foreground">Контент (utm_content):</span>{" "}
              <b className="text-foreground">{app.utm_content}</b>
            </p>
          )}
          {app.utm_term && (
            <p>
              <span className="text-muted-foreground">Ключ (utm_term):</span>{" "}
              <b className="text-foreground">{app.utm_term}</b>
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  };

  /**
   * Render compliance badge "152-ФЗ Согласие подтверждено" with tooltip
   */
  const renderConsentBadge = (app: Application) => {
    const isConsentConfirmed = app.consent_given !== false;

    if (!isConsentConfirmed) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-800 border-amber-300 gap-1 text-[11px] font-medium"
        >
          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
          <span>Проверка</span>
        </Badge>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help inline-block">
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1.5 font-medium text-[11px] hover:bg-emerald-100 transition-colors whitespace-nowrap dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>152-ФЗ Согласие подтверждено</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3 space-y-1.5 text-xs z-50">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 border-b pb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Цифровой след согласия 152-ФЗ</span>
          </div>
          <p>
            <span className="text-muted-foreground">Статус:</span>{" "}
            <b className="text-emerald-700 dark:text-emerald-300">Подтверждено (чекбокс)</b>
          </p>
          <p>
            <span className="text-muted-foreground">Версия политики:</span>{" "}
            <b className="text-foreground">{app.consent_policy_version || "2026.1"}</b>
          </p>
          <p>
            <span className="text-muted-foreground">Время фиксации:</span>{" "}
            <b className="text-foreground">
              {formatDateSafe(app.consent_timestamp || app.created_at)}
            </b>
          </p>
          <p>
            <span className="text-muted-foreground">IP-адрес:</span>{" "}
            <b className="text-foreground font-mono">{app.client_ip || "Зафиксирован сервером"}</b>
          </p>
          <p className="text-[10px] text-muted-foreground pt-1 border-t">
            Ст. 9 Федерального закона № 152-ФЗ
          </p>
        </TooltipContent>
      </Tooltip>
    );
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
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        {/* Верхние информационные чипсы по статусам */}
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
              {counts.pending > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
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

        {/* Панель поиска, фильтра по каналам и экспорта */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-3 rounded-xl border border-border">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            {/* Поиск */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, телефону, тарифу, источнику..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 text-xs sm:text-sm h-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  title="Очистить поиск"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Фильтр по каналу / источнику */}
            <div className="w-full sm:w-[210px] shrink-0">
              <Select value={filterChannel} onValueChange={setFilterChannel}>
                <SelectTrigger className="h-9 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 truncate">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Все каналы" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все каналы</SelectItem>
                  <SelectItem value="utm">Рекламные (все с UTM)</SelectItem>
                  <SelectItem value="direct">Прямой заход (без меток)</SelectItem>
                  {availableSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {formatMarketingSource(source)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end">
            <span className="text-xs text-muted-foreground">
              Найдено: <b>{filteredApplications.length}</b>
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="gap-2 text-xs sm:text-sm whitespace-nowrap h-9"
              title="Экспорт отфильтрованных заявок в Excel (CSV) с UTF-8 BOM"
            >
              <Download className="w-4 h-4 text-primary" />
              Экспорт в Excel (CSV)
            </Button>
          </div>
        </div>

        {/* Таблица заявок с UTM и 152-ФЗ */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[50px] text-xs font-semibold">ID</TableHead>
                  <TableHead className="text-xs font-semibold min-w-[130px]">Клиент</TableHead>
                  <TableHead className="text-xs font-semibold min-w-[150px]">
                    Телефон / Связь
                  </TableHead>
                  <TableHead className="text-xs font-semibold">Тариф</TableHead>
                  <TableHead className="text-xs font-semibold min-w-[130px]">
                    Канал / UTM
                  </TableHead>
                  <TableHead className="text-xs font-semibold min-w-[180px]">
                    152-ФЗ Согласие
                  </TableHead>
                  <TableHead className="text-xs font-semibold min-w-[120px]">Статус</TableHead>
                  <TableHead className="text-xs font-semibold min-w-[100px]">Дата</TableHead>
                  <TableHead className="w-[90px] text-xs font-semibold text-right">
                    Действия
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="text-base font-medium">Заявки не найдены</div>
                      <div className="text-xs mt-1">
                        Попробуйте изменить фильтр по каналу, статусу или поисковый запрос
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => {
                    const cleanPhone = cleanPhoneForWhatsApp(app.phone);
                    return (
                      <TableRow
                        key={app.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          #{app.id}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-sm text-foreground">{app.name}</div>
                          {app.age && (
                            <div className="text-xs text-muted-foreground">Возраст: {app.age}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${app.phone}`}
                              className="text-xs sm:text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                              title="Позвонить по телефону"
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
                                className="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300"
                                title="Написать в WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium px-2 py-1 rounded bg-muted whitespace-nowrap">
                            {app.tariff || app.age || "Не указан"}
                          </span>
                        </TableCell>
                        <TableCell>{renderUTMBadge(app)}</TableCell>
                        <TableCell>{renderConsentBadge(app)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(app.status)}
                            <Select
                              value={app.status}
                              onValueChange={(val) => handleStatusChange(app.id, val)}
                            >
                              <SelectTrigger
                                className="h-7 w-7 p-0 border-dashed"
                                title="Изменить статус"
                              >
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
                          {formatDateSafe(app.created_at)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {/* Кнопка подробностей и аудита */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedApp(app)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              title="Просмотр карточки заявки и аудита 152-ФЗ"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* Кнопка удаления с подтверждением */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  title="Удалить заявку"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Удалить заявку #{app.id}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Вы действительно хотите удалить заявку от <b>{app.name}</b> (
                                    {app.phone})? Это действие нельзя отменить.
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
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Детальный диалог аудита заявки, UTM и согласия 152-ФЗ */}
        <Dialog
          open={Boolean(selectedApp)}
          onOpenChange={(open) => !open && setSelectedApp(null)}
        >
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            {selectedApp && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <span>Заявка #{selectedApp.id}</span>
                    {getStatusBadge(selectedApp.status)}
                  </DialogTitle>
                  <DialogDescription>
                    Детальная маркетинговая атрибуция и юридический след согласия 152-ФЗ
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2 text-sm">
                  {/* Блок данных клиента */}
                  <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" /> Данные клиента
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-muted-foreground">Имя:</span>{" "}
                        <b className="text-foreground">{selectedApp.name}</b>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Тариф / Направление:</span>{" "}
                        <b className="text-foreground">
                          {selectedApp.tariff || selectedApp.age || "Не указан"}
                        </b>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Телефон:</span>{" "}
                        <a
                          href={`tel:${selectedApp.phone}`}
                          className="text-primary hover:underline font-mono"
                        >
                          {selectedApp.phone}
                        </a>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Дата создания:</span>{" "}
                        <span className="text-foreground">
                          {formatDateSafe(selectedApp.created_at)}
                        </span>
                      </div>
                    </div>
                    {selectedApp.notes && (
                      <div className="pt-2 border-t text-xs">
                        <span className="text-muted-foreground">Заметки:</span>{" "}
                        {selectedApp.notes}
                      </div>
                    )}
                  </div>

                  {/* Блок маркетинга и UTM меток */}
                  <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Маркетинговые метрики (UTM)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-background border">
                        <span className="text-muted-foreground block text-[11px]">
                          Источник (utm_source):
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedApp.utm_source
                            ? `${selectedApp.utm_source} (${formatMarketingSource(
                                selectedApp.utm_source,
                                selectedApp.utm_medium
                              )})`
                            : "Прямой заход (Органика)"}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-background border">
                        <span className="text-muted-foreground block text-[11px]">
                          Кампания (utm_campaign):
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedApp.utm_campaign || "—"}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-background border">
                        <span className="text-muted-foreground block text-[11px]">
                          Канал трафика (utm_medium):
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedApp.utm_medium || "—"}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-background border">
                        <span className="text-muted-foreground block text-[11px]">
                          Контент объявления (utm_content):
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedApp.utm_content || "—"}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-background border sm:col-span-2">
                        <span className="text-muted-foreground block text-[11px]">
                          Ключевая фраза (utm_term):
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedApp.utm_term || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Блок 152-ФЗ */}
                  <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800/50 space-y-2">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Юридический след
                      согласия 152-ФЗ
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-background/80 border">
                        <span className="text-muted-foreground block text-[11px]">
                          Статус согласия:
                        </span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                          {selectedApp.consent_given !== false
                            ? "Подтверждено пользователем"
                            : "Не подтверждено"}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-background/80 border">
                        <span className="text-muted-foreground block text-[11px]">
                          Версия политики:
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedApp.consent_policy_version || "2026.1"}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-background/80 border">
                        <span className="text-muted-foreground block text-[11px]">
                          Время фиксации согласия:
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatDateSafe(
                            selectedApp.consent_timestamp || selectedApp.created_at
                          )}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-background/80 border">
                        <span className="text-muted-foreground block text-[11px]">
                          IP-адрес заявителя:
                        </span>
                        <span className="font-mono font-semibold text-foreground">
                          {selectedApp.client_ip || "Зафиксирован сервером"}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground pt-1">
                      Фиксация согласия выполнена в соответствии с требованиями Федерального
                      закона от 27.07.2006 № 152-ФЗ «О персональных данных».
                    </p>
                  </div>
                </div>

                <DialogFooter className="flex flex-row justify-between sm:justify-between items-center gap-2 pt-2">
                  {cleanPhoneForWhatsApp(selectedApp.phone) ? (
                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(
                        selectedApp.phone
                      )}?text=${encodeURIComponent(
                        `Здравствуйте, ${selectedApp.name}! Горнолыжная школа «Вершина». Вы оставляли заявку на нашем сайте.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Написать в WhatsApp
                      </Button>
                    </a>
                  ) : (
                    <div />
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setSelectedApp(null)}
                    className="text-xs"
                  >
                    Закрыть
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AdminApplications;
