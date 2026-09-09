import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Admin from "../Admin";
import * as auth from "@/lib/auth";
import * as api from "@/lib/api";
import { toast } from "sonner";

vi.mock("@/lib/auth", () => ({
  getAuthToken: vi.fn(),
  setAuthToken: vi.fn(),
  setRefreshToken: vi.fn(),
  removeAuthToken: vi.fn(),
  isTokenExpired: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  adminLogin: vi.fn(),
  getApplications: vi.fn().mockResolvedValue([]),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock child admin panel tabs to isolate Admin page shell orchestration
vi.mock("@/components/admin/AdminApplications", () => ({
  default: () => <div data-testid="tab-applications">Applications Tab Content</div>,
}));
vi.mock("@/components/admin/AdminTariffs", () => ({
  default: () => <div data-testid="tab-tariffs">Tariffs Tab Content</div>,
}));
vi.mock("@/components/admin/AdminSchedule", () => ({
  default: () => <div data-testid="tab-schedule">Schedule Tab Content</div>,
}));
vi.mock("@/components/admin/AdminLocations", () => ({
  default: () => <div data-testid="tab-locations">Locations Tab Content</div>,
}));
vi.mock("@/components/admin/AdminCamps", () => ({
  default: () => <div data-testid="tab-camps">Camps Tab Content</div>,
}));
vi.mock("@/components/admin/AdminStats", () => ({
  default: () => <div data-testid="tab-stats">Stats Tab Content</div>,
}));
vi.mock("@/components/admin/AdminTrainers", () => ({
  default: () => <div data-testid="tab-trainers">Trainers Tab Content</div>,
}));
vi.mock("@/components/admin/AdminMedia", () => ({
  default: () => <div data-testid="tab-media">Media Tab Content</div>,
}));
vi.mock("@/components/admin/AdminAbout", () => ({
  default: () => <div data-testid="tab-about">About Tab Content</div>,
}));
vi.mock("@/components/admin/AdminLegal", () => ({
  default: () => <div data-testid="tab-legal">Legal Tab Content</div>,
}));

describe("Admin Page - Authentication & Dashboard Orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAdmin = () =>
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Admin />
      </MemoryRouter>
    );

  it("renders login screen when unauthenticated (username, password inputs, submit button)", async () => {
    vi.mocked(auth.getAuthToken).mockReturnValue(null);
    vi.mocked(auth.isTokenExpired).mockReturnValue(true);

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText("Вход в панель управления")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Имя пользователя", { selector: "input" })).toBeInTheDocument();
    expect(screen.getByLabelText("Пароль", { selector: "input" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Войти" })
    ).toBeInTheDocument();
  });

  it("transitions to Admin Dashboard upon successful login", async () => {
    vi.mocked(auth.getAuthToken).mockReturnValue(null);
    vi.mocked(auth.isTokenExpired).mockReturnValue(true);
    vi.mocked(api.adminLogin).mockResolvedValue({
      access_token: "mock_jwt_access_token",
      refresh_token: "mock_jwt_refresh_token",
    });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText("Вход в панель управления")).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText("Имя пользователя", { selector: "input" });
    const passwordInput = screen.getByLabelText("Пароль", { selector: "input" });
    const submitButton = screen.getByRole("button", { name: "Войти" });

    fireEvent.change(usernameInput, { target: { value: "admin" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.adminLogin).toHaveBeenCalledWith("admin", "secret123");
      expect(auth.setAuthToken).toHaveBeenCalledWith("mock_jwt_access_token");
      expect(auth.setRefreshToken).toHaveBeenCalledWith("mock_jwt_refresh_token");
      expect(toast.success).toHaveBeenCalledWith("Вход выполнен успешно");
    });

    // Verify Admin Dashboard header is rendered
    expect(screen.getByText("VERSHINA")).toBeInTheDocument();
    expect(screen.getByText("Control Panel")).toBeInTheDocument();
  });

  it("displays dashboard with all 10 required navigation tabs when authenticated", async () => {
    vi.mocked(auth.getAuthToken).mockReturnValue("valid_token");
    vi.mocked(auth.isTokenExpired).mockReturnValue(false);

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText("VERSHINA")).toBeInTheDocument();
      expect(screen.getByText("Control Panel")).toBeInTheDocument();
    });

    // Required tabs from spec:
    // "Заявки", "Тарифы", "Расписание", "Локации", "Сборы", "Статистика", "Тренеры", "Медиа", "О нас", "Документы 152-ФЗ"
    const expectedTabs = [
      "Заявки",
      "Тарифы",
      "Расписание",
      "Локации",
      "Сборы",
      "Статистика",
      "Тренеры",
      "Медиа",
      "О нас",
      "Документы 152-ФЗ",
    ];

    for (const tabTitle of expectedTabs) {
      expect(
        screen.getByRole("tab", { name: new RegExp(tabTitle, "i") })
      ).toBeInTheDocument();
    }

    // By default, "Заявки" tab is active and rendered
    expect(screen.getByTestId("tab-applications")).toBeInTheDocument();
  });

  it("switches tabs to show the corresponding tab content", async () => {
    vi.mocked(auth.getAuthToken).mockReturnValue("valid_token");
    vi.mocked(auth.isTokenExpired).mockReturnValue(false);

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText("VERSHINA")).toBeInTheDocument();
    });

    // Click "Тарифы" tab
    const user = userEvent.setup();
    const tariffsTab = screen.getByRole("tab", { name: /Тарифы/i });
    await user.click(tariffsTab);

    await waitFor(() => {
      expect(screen.getByTestId("tab-tariffs")).toBeInTheDocument();
    });

    // Click "Документы 152-ФЗ" tab
    const legalTab = screen.getByRole("tab", { name: /Документы 152-ФЗ/i });
    await user.click(legalTab);

    await waitFor(() => {
      expect(screen.getByTestId("tab-legal")).toBeInTheDocument();
    });
  });

  it("logout button clears token and returns to login screen", async () => {
    vi.mocked(auth.getAuthToken).mockReturnValue("valid_token");
    vi.mocked(auth.isTokenExpired).mockReturnValue(false);

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText("VERSHINA")).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole("button", { name: /Выйти/i });
    fireEvent.click(logoutButton);

    expect(auth.removeAuthToken).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Выход выполнен");

    await waitFor(() => {
      expect(screen.getByText("Вход в панель управления")).toBeInTheDocument();
      expect(screen.queryByText("VERSHINA")).not.toBeInTheDocument();
    });
  });

  it("shows error message when login fails with invalid credentials", async () => {
    vi.mocked(auth.getAuthToken).mockReturnValue(null);
    vi.mocked(auth.isTokenExpired).mockReturnValue(true);
    vi.mocked(api.adminLogin).mockRejectedValue(new Error("Invalid credentials"));

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText("Вход в панель управления")).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText("Имя пользователя", { selector: "input" });
    const passwordInput = screen.getByLabelText("Пароль", { selector: "input" });
    const submitButton = screen.getByRole("button", { name: "Войти" });

    fireEvent.change(usernameInput, { target: { value: "wrong" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Неверное имя пользователя или пароль")
      ).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Ошибка входа");
    });
  });

  it("handles expired token on mount by removing token and showing notification", async () => {
    vi.mocked(auth.getAuthToken).mockReturnValue("expired_token");
    vi.mocked(auth.isTokenExpired).mockReturnValue(true);

    renderAdmin();

    await waitFor(() => {
      expect(auth.removeAuthToken).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        "Сессия истекла. Пожалуйста, войдите снова."
      );
      expect(screen.getByText("Вход в панель управления")).toBeInTheDocument();
    });
  });

  it("toggles password visibility when eye icon button is clicked", async () => {
    vi.mocked(auth.getAuthToken).mockReturnValue(null);
    vi.mocked(auth.isTokenExpired).mockReturnValue(true);

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText("Вход в панель управления")).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText("Пароль", { selector: "input" }) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleButton = screen.getByLabelText("Показать пароль");
    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe("text");

    const hideButton = screen.getByLabelText("Скрыть пароль");
    fireEvent.click(hideButton);

    expect(passwordInput.type).toBe("password");
  });
});
