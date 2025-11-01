import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminLogin } from "@/lib/api";
import { getAuthToken, setAuthToken, removeAuthToken, isTokenExpired } from "@/lib/auth";
import AdminApplications from "@/components/admin/AdminApplications";
import AdminSchedule from "@/components/admin/AdminSchedule";
import AdminLocations from "@/components/admin/AdminLocations";
import AdminCamps from "@/components/admin/AdminCamps";
import AdminStats from "@/components/admin/AdminStats";
import AdminAbout from "@/components/admin/AdminAbout";
import AdminTrainers from "@/components/admin/AdminTrainers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    try {
      const { token } = await adminLogin(username, password);
      setAuthToken(token);
      setIsAuthenticated(true);
      toast.success("Вход выполнен успешно");
    } catch (err) {
      setError("Неверные учетные данные");
      toast.error("Ошибка входа");
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

    // Проверка каждые 5 минут
    const interval = setInterval(checkToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Вход в админ-панель</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Имя пользователя</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button type="submit" className="w-full">
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Админ-панель - Школа Вершина
            </h1>
            <Button variant="destructive" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Tabs defaultValue="applications" className="space-y-4">
                 <TabsList className="grid w-full grid-cols-7">
                   <TabsTrigger value="applications">Заявки</TabsTrigger>
                   <TabsTrigger value="schedule">Расписание</TabsTrigger>
                   <TabsTrigger value="locations">Локации</TabsTrigger>
                   <TabsTrigger value="camps">Сборы</TabsTrigger>
                   <TabsTrigger value="stats">Статистика</TabsTrigger>
                   <TabsTrigger value="about">О нас</TabsTrigger>
                   <TabsTrigger value="trainers">Тренеры</TabsTrigger>
                 </TabsList>

          <TabsContent value="applications">
            <AdminApplications />
          </TabsContent>

          <TabsContent value="schedule">
            <AdminSchedule />
          </TabsContent>

          <TabsContent value="locations">
            <AdminLocations />
          </TabsContent>

          <TabsContent value="camps">
            <AdminCamps />
          </TabsContent>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

                 <TabsContent value="about">
                   <AdminAbout />
                 </TabsContent>

                 <TabsContent value="trainers">
                   <AdminTrainers />
                 </TabsContent>
               </Tabs>
             </div>
           </div>
         );
       };

       export default Admin;

