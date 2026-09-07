import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminLogin, getApplications, type Application } from "@/lib/api";
import { getAuthToken, setAuthToken, setRefreshToken, removeAuthToken, isTokenExpired } from "@/lib/auth";
import AdminApplications from "@/components/admin/AdminApplications";
import AdminTariffs from "@/components/admin/AdminTariffs";
import AdminSchedule from "@/components/admin/AdminSchedule";
import AdminLocations from "@/components/admin/AdminLocations";
import AdminCamps from "@/components/admin/AdminCamps";
import AdminStats from "@/components/admin/AdminStats";
import AdminAbout from "@/components/admin/AdminAbout";
import AdminTrainers from "@/components/admin/AdminTrainers";
import AdminMedia from "@/components/admin/AdminMedia";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  FileText,
  CreditCard,
  Calendar,
  MapPin,
  Tent,
  Award,
  Users,
  Image as ImageIcon,
  Info,
  ExternalLink,
  LogOut,
  Eye,
  EyeOff,
  Mountain,
  ShieldCheck,
} from "lucide-react";

// Вспомогательный бейдж счетчика новых заявок
const PendingApplicationsBadge = () => {
  const { data: applications = [] } = useQuery<Application[]>({
    queryKey: ["admin-applications"],
    queryFn: getApplications,
    staleTime: 30000,
    retry: false,
  });

  const pendingCount = applications.filter((app) => app.status === "pending").length;
  if (pendingCount === 0) return null;

  return (
    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-white leading-normal">
      {pendingCount}
    </span>
  );
};

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Верхняя навигационная панель */}
      <header className="bg-ski-black text-ski-white sticky top-0 z-30 shadow-md border-b border-ski-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Бренд */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                <Mountain className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-wider text-ski-white">VERSHINA</span>
                <span className="ml-2 text-xs text-primary font-semibold uppercase tracking-wider hidden sm:inline">
                  Control Panel
                </span>
              </div>
            </div>

            {/* Действия */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex"
              >
                <Button variant="ghost" size="sm" className="text-ski-white/80 hover:text-ski-white hover:bg-ski-white/10 gap-1.5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Открыть сайт
                </Button>
              </a>

              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-ski-white/10 text-xs text-ski-white/70">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Администратор</span>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={onLogout}
                className="gap-1.5 text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент панели */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Tabs defaultValue="applications" className="space-y-4 sm:space-y-6">
          {/* Стилизованные вкладки навигации */}
          <div className="bg-card p-1.5 rounded-xl border border-border shadow-sm overflow-x-auto">
            <TabsList className="flex w-max min-w-full justify-start gap-1 bg-transparent p-0 h-auto">
              <TabsTrigger
                value="applications"
                className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Заявки</span>
                <PendingApplicationsBadge />
              </TabsTrigger>

              <TabsTrigger
                value="tariffs"
                className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Тарифы</span>
              </TabsTrigger>

              <TabsTrigger
                value="schedule"
                className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Расписание</span>
              </TabsTrigger>

              <TabsTrigger
                value="locations"
                className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>Локации</span>
              </TabsTrigger>

              <TabsTrigger
                value="camps"
                className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Tent className="w-4 h-4" />
                <span>Сборы</span>
              </TabsTrigger>

              <TabsTrigger
                value="stats"
                className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Статистика</span>
              </TabsTrigger>

              <TabsTrigger
                value="trainers"
                className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Тренеры</span>
              </TabsTrigger>

              <TabsTrigger
                value="media"
                className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Медиа</span>
              </TabsTrigger>

              <TabsTrigger
                value="about"
                className="flex items-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Info className="w-4 h-4" />
                <span>О нас</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Содержимое вкладок */}
          <TabsContent value="applications" className="focus-visible:outline-none">
            <AdminApplications />
          </TabsContent>

          <TabsContent value="tariffs" className="focus-visible:outline-none">
            <AdminTariffs />
          </TabsContent>

          <TabsContent value="schedule" className="focus-visible:outline-none">
            <AdminSchedule />
          </TabsContent>

          <TabsContent value="locations" className="focus-visible:outline-none">
            <AdminLocations />
          </TabsContent>

          <TabsContent value="camps" className="focus-visible:outline-none">
            <AdminCamps />
          </TabsContent>

          <TabsContent value="stats" className="focus-visible:outline-none">
            <AdminStats />
          </TabsContent>

          <TabsContent value="trainers" className="focus-visible:outline-none">
            <AdminTrainers />
          </TabsContent>

          <TabsContent value="media" className="focus-visible:outline-none">
            <AdminMedia />
          </TabsContent>

          <TabsContent value="about" className="focus-visible:outline-none">
            <AdminAbout />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const Admin = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (token && !isTokenExpired(token)) {
      setIsAuthenticated(true);
    } else {
      if (token) {
        removeAuthToken();
        toast.error("Сессия истекла. Пожалуйста, войдите снова.");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { access_token, refresh_token } = await adminLogin(username, password);
      setAuthToken(access_token);
      setRefreshToken(refresh_token);
      setIsAuthenticated(true);
      toast.success("Вход выполнен успешно");
    } catch {
      setError("Неверное имя пользователя или пароль");
      toast.error("Ошибка входа");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setError("");
    toast.success("Выход выполнен");
  };

  // Периодическая проверка истечения токена
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkToken = () => {
      const token = getAuthToken();
      if (!token || isTokenExpired(token)) {
        removeAuthToken();
        setIsAuthenticated(false);
        toast.error("Сессия истекла. Пожалуйста, войдите снова.");
        navigate("/admin", { replace: true });
      }
    };

    const interval = setInterval(checkToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-ski-black text-ski-white gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-medium tracking-wide">Загрузка панели управления...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ski-black via-ski-gray to-ski-black px-4 py-8 relative overflow-hidden">
        {/* Декоративные фоновые элементы */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <Card className="w-full max-w-md bg-card/95 backdrop-blur-md border-border/80 shadow-2xl relative z-10">
          <CardHeader className="text-center pb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-hero text-ski-white mx-auto flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
              <Mountain className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Вход в панель управления</CardTitle>
            <CardDescription>Школа горнолыжного спорта «Вершина»</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Имя пользователя</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoFocus
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-base font-semibold bg-gradient-hero hover:opacity-95 shadow-md shadow-primary/20 mt-2"
              >
                {isSubmitting ? "Проверка..." : "Войти"}
              </Button>

              <div className="text-center pt-2">
                <a href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  ← Вернуться на главную страницу
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboard onLogout={handleLogout} />
    </QueryClientProvider>
  );
};

export default Admin;
