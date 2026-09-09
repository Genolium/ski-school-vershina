import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminLegal from "../AdminLegal";
import {
  LEGAL_SETTINGS_STORAGE_KEY,
  DEFAULT_LEGAL_SETTINGS,
  RKN_GOSUSLUGI_URL,
  RKN_NOTIFICATION_PORTAL_URL,
  RKN_REGISTRY_SEARCH_URL,
  getLegalSettings,
} from "@/lib/legalSettings";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminLegal - 152-ФЗ Legal Compliance & Operator Settings", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <AdminLegal />
      </QueryClientProvider>
    );

  it("renders operator details fields (name, inn, ogrn, email, phone, address)", async () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/Наименование оператора/i) as HTMLInputElement;
    const innInput = screen.getByLabelText(/ИНН оператора/i) as HTMLInputElement;
    const ogrnInput = screen.getByLabelText(/ОГРН \/ ОГРНИП/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email для обращений/i) as HTMLInputElement;
    const phoneInput = screen.getByLabelText(/Контактный телефон оператора/i) as HTMLInputElement;
    const addressInput = screen.getByLabelText(/Местонахождение \/ Адрес оператора/i) as HTMLInputElement;

    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toBe(DEFAULT_LEGAL_SETTINGS.operator.name);

    expect(innInput).toBeInTheDocument();
    expect(innInput.value).toBe(DEFAULT_LEGAL_SETTINGS.operator.inn);

    expect(ogrnInput).toBeInTheDocument();
    expect(ogrnInput.value).toBe(DEFAULT_LEGAL_SETTINGS.operator.ogrn);

    expect(emailInput).toBeInTheDocument();
    expect(emailInput.value).toBe(DEFAULT_LEGAL_SETTINGS.operator.email);

    expect(phoneInput).toBeInTheDocument();
    expect(phoneInput.value).toBe(DEFAULT_LEGAL_SETTINGS.operator.phone);

    expect(addressInput).toBeInTheDocument();
    expect(addressInput.value).toBe(DEFAULT_LEGAL_SETTINGS.operator.address);
  });

  it("renders Roskomnadzor banner with links to Gosuslugi and pd.rkn.gov.ru, and registration fields", async () => {
    const user = userEvent.setup();
    renderComponent();

    // Switch to Roskomnadzor tab
    const rknTab = screen.getByRole("tab", { name: /Роскомнадзор/i });
    await user.click(rknTab);

    // Verify informational banner
    expect(
      screen.getByText(/Требования статьи 22 Федерального закона № 152-ФЗ/i)
    ).toBeInTheDocument();

    // Verify official links
    const gosuslugiLink = screen.getByRole("link", { name: /Подать через Госуслуги/i });
    expect(gosuslugiLink).toHaveAttribute("href", RKN_GOSUSLUGI_URL);
    expect(gosuslugiLink).toHaveAttribute("target", "_blank");

    const rknPortalLink = screen.getByRole("link", { name: /Портал РКН \(pd\.rkn\.gov\.ru\)/i });
    expect(rknPortalLink).toHaveAttribute("href", RKN_NOTIFICATION_PORTAL_URL);
    expect(rknPortalLink).toHaveAttribute("target", "_blank");

    const rknRegistryLink = screen.getByRole("link", { name: /Проверить в Реестре РКН/i });
    expect(rknRegistryLink).toHaveAttribute("href", RKN_REGISTRY_SEARCH_URL);
    expect(rknRegistryLink).toHaveAttribute("target", "_blank");

    // Verify registration form fields
    expect(screen.getByLabelText(/Уведомление направлено в Роскомнадзор/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Дата направления уведомления/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Оператор внесен в Реестр операторов ПДн/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Рег\. номер в реестре/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Дата внесения/i)).toBeInTheDocument();
  });

  it("editing operator name and clicking 'Сохранить изменения' updates localStorage via legalSettings", async () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/Наименование оператора/i);
    fireEvent.change(nameInput, { target: { value: "ИП Смирнов А.А. (Школа Вершина)" } });

    // Save button changes label from "Сохранено" to "Сохранить изменения"
    const saveButton = screen.getByRole("button", { name: /Сохранить изменения/i });
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);

    // Verify toast
    expect(toast.success).toHaveBeenCalledWith(
      "Настройки правовых документов 152-ФЗ успешно сохранены"
    );

    // Verify localStorage was updated
    const stored = JSON.parse(localStorage.getItem(LEGAL_SETTINGS_STORAGE_KEY) || "{}");
    expect(stored.operator.name).toBe("ИП Смирнов А.А. (Школа Вершина)");

    // Verify legalSettings module returns updated value
    expect(getLegalSettings().operator.name).toBe("ИП Смирнов А.А. (Школа Вершина)");
  });

  it("'Сбросить к типовым 152-ФЗ' button opens confirmation dialog and restores default legal settings", async () => {
    // Preset custom modified value in localStorage
    const modifiedSettings = {
      ...DEFAULT_LEGAL_SETTINGS,
      operator: {
        ...DEFAULT_LEGAL_SETTINGS.operator,
        name: "Кастомная Организация 123",
      },
    };
    localStorage.setItem(LEGAL_SETTINGS_STORAGE_KEY, JSON.stringify(modifiedSettings));

    renderComponent();

    const nameInput = screen.getByLabelText(/Наименование оператора/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Кастомная Организация 123");

    // Click "Сбросить к типовым 152-ФЗ"
    const resetButton = screen.getByRole("button", { name: /Сбросить к типовым 152-ФЗ/i });
    fireEvent.click(resetButton);

    // Confirmation AlertDialog opens
    expect(
      await screen.findByText("Сбросить настройки к типовым 152-ФЗ?")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Все текущие реквизиты, статус Роскомнадзора, перечни целей/i)
    ).toBeInTheDocument();

    // Confirm reset
    const confirmButton = screen.getByRole("button", { name: "Да, сбросить" });
    fireEvent.click(confirmButton);

    // Verify toast
    expect(toast.success).toHaveBeenCalledWith(
      "Настройки сброшены к типовым значениям 152-ФЗ"
    );

    // Verify value in input was restored to default
    await waitFor(() => {
      expect((screen.getByLabelText(/Наименование оператора/i) as HTMLInputElement).value).toBe(
        DEFAULT_LEGAL_SETTINGS.operator.name
      );
    });

    // Verify localStorage restored to default
    const stored = JSON.parse(localStorage.getItem(LEGAL_SETTINGS_STORAGE_KEY) || "{}");
    expect(stored.operator.name).toBe(DEFAULT_LEGAL_SETTINGS.operator.name);
  });

  it("updates Roskomnadzor status badge when status is changed", async () => {
    const user = userEvent.setup();
    renderComponent();

    // Default badge: "Требуется подача уведомления по ст. 22 152-ФЗ"
    expect(
      screen.getByText("Требуется подача уведомления по ст. 22 152-ФЗ")
    ).toBeInTheDocument();

    // Navigate to RKN tab
    const rknTab = screen.getByRole("tab", { name: /Роскомнадзор/i });
    await user.click(rknTab);

    // Toggle registered switch
    const registeredSwitch = screen.getByRole("switch", {
      name: /Оператор внесен в Реестр операторов ПДн/i,
    });
    fireEvent.click(registeredSwitch);

    // Enter reg number
    const regNumberInput = screen.getByLabelText(/Рег\. номер в реестре/i);
    fireEvent.change(regNumberInput, { target: { value: "78-26-099887" } });

    // Badge should now indicate registration in RKN
    expect(
      screen.getByText(/В реестре операторов РКН \(№ 78-26-099887\)/i)
    ).toBeInTheDocument();
  });

  it("allows adding and removing custom consent data categories", async () => {
    const user = userEvent.setup();
    renderComponent();

    // Navigate to Consent tab (4. Текст Согласия)
    const consentTab = screen.getByRole("tab", { name: /Текст Согласия/i });
    await user.click(consentTab);

    // Check default data types are rendered
    expect(screen.getByText("Фамилия, имя, отчество (или имя)")).toBeInTheDocument();

    // Add a new data type
    const newTypeInput = screen.getByPlaceholderText(
      /Добавить новую категорию данных/i
    );
    fireEvent.change(newTypeInput, { target: { value: "Возраст ребенка и размер лыж" } });

    const addButtons = screen.getAllByRole("button", { name: "Добавить" });
    fireEvent.click(addButtons[0]);

    // Newly added type should now appear in the list
    expect(screen.getByText("Возраст ребенка и размер лыж")).toBeInTheDocument();

    // Delete category
    const deleteButtons = screen.getAllByTitle("Удалить категорию");
    fireEvent.click(deleteButtons[0]);

    // First element should have been removed
    expect(screen.queryByText("Фамилия, имя, отчество (или имя)")).not.toBeInTheDocument();
  });
});
