import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ItemsArrayInput } from "../ItemsArrayInput";

describe("ItemsArrayInput Component", () => {
  it("renders with label, initial items, description, and serialized JSON hidden input", () => {
    const initialJson = JSON.stringify(["Проживание", "Питание"]);
    const { container } = render(
      <ItemsArrayInput
        id="camps-features"
        name="features"
        label="Особенности сборов"
        defaultValue={initialJson}
        description="Укажите что включено"
      />
    );

    expect(screen.getByText("Особенности сборов")).toBeInTheDocument();
    expect(screen.getByText("(2)")).toBeInTheDocument();
    expect(screen.getByText("Укажите что включено")).toBeInTheDocument();

    expect(screen.getByText("Проживание")).toBeInTheDocument();
    expect(screen.getByText("Питание")).toBeInTheDocument();

    const hiddenInput = container.querySelector("input[name='features']") as HTMLInputElement;
    expect(hiddenInput).toBeInTheDocument();
    expect(JSON.parse(hiddenInput.value)).toEqual(["Проживание", "Питание"]);
  });

  it("adds item via input field and 'Добавить' button, updating hidden input", () => {
    const { container } = render(
      <ItemsArrayInput
        name="features"
        label="Пункты"
        defaultValue="[]"
      />
    );

    const input = screen.getByPlaceholderText(/Введите пункт/i);
    const addBtn = screen.getByRole("button", { name: /Добавить/i });

    expect(addBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: "Ски-пасс" } });
    expect(addBtn).not.toBeDisabled();

    fireEvent.click(addBtn);

    expect(screen.getByText("Ски-пасс")).toBeInTheDocument();
    expect(input).toHaveValue("");

    const hiddenInput = container.querySelector("input[name='features']") as HTMLInputElement;
    expect(JSON.parse(hiddenInput.value)).toEqual(["Ски-пасс"]);
  });

  it("adds item via Enter key in input field", () => {
    const { container } = render(
      <ItemsArrayInput
        name="features"
        label="Пункты"
        defaultValue="[]"
      />
    );

    const input = screen.getByPlaceholderText(/Введите пункт/i);

    fireEvent.change(input, { target: { value: "Трансфер из аэропорта" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByText("Трансфер из аэропорта")).toBeInTheDocument();
    expect(input).toHaveValue("");

    const hiddenInput = container.querySelector("input[name='features']") as HTMLInputElement;
    expect(JSON.parse(hiddenInput.value)).toEqual(["Трансфер из аэропорта"]);
  });

  it("removes item when clicking the X button", () => {
    const initialJson = JSON.stringify(["Пункт 1", "Пункт 2", "Пункт 3"]);
    const { container } = render(
      <ItemsArrayInput
        name="features"
        label="Пункты"
        defaultValue={initialJson}
      />
    );

    expect(screen.getByText("Пункт 2")).toBeInTheDocument();

    const deleteButtons = screen.getAllByTitle("Удалить");
    expect(deleteButtons.length).toBe(3);

    // Delete "Пункт 2" (index 1)
    fireEvent.click(deleteButtons[1]);

    expect(screen.queryByText("Пункт 2")).not.toBeInTheDocument();
    expect(screen.getByText("Пункт 1")).toBeInTheDocument();
    expect(screen.getByText("Пункт 3")).toBeInTheDocument();

    const hiddenInput = container.querySelector("input[name='features']") as HTMLInputElement;
    expect(JSON.parse(hiddenInput.value)).toEqual(["Пункт 1", "Пункт 3"]);
  });

  it("clicking preset chips adds them to the list and disables them", () => {
    const presets = ["Проживание", "Ски-пасс", "3-х разовое питание"];
    const { container } = render(
      <ItemsArrayInput
        name="features"
        label="Пункты"
        defaultValue={JSON.stringify(["Проживание"])}
        presets={presets}
      />
    );

    // "Проживание" preset should be disabled because it's already in the list
    const lodgingPreset = screen.getByRole("button", { name: "Проживание" });
    expect(lodgingPreset).toBeDisabled();

    // "Ски-пасс" is enabled
    const skipassPreset = screen.getByRole("button", { name: "Ски-пасс" });
    expect(skipassPreset).not.toBeDisabled();

    fireEvent.click(skipassPreset);

    // Now "Ски-пасс" is in list and preset button becomes disabled
    expect(screen.getAllByText("Ски-пасс").length).toBeGreaterThanOrEqual(1);
    expect(skipassPreset).toBeDisabled();

    const hiddenInput = container.querySelector("input[name='features']") as HTMLInputElement;
    expect(JSON.parse(hiddenInput.value)).toEqual(["Проживание", "Ски-пасс"]);
  });

  it("bulk text mode parses multiline and semicolon text correctly", () => {
    const { container } = render(
      <ItemsArrayInput
        name="features"
        label="Пункты"
        defaultValue={JSON.stringify(["Пункт A"])}
      />
    );

    // Open bulk mode
    const bulkModeBtn = screen.getByRole("button", { name: /Списком \/ Текстом/i });
    fireEvent.click(bulkModeBtn);

    const textarea = screen.getByPlaceholderText(/Введите каждый пункт с новой строки/i);
    expect(textarea).toHaveValue("Пункт A");

    // Enter multiple lines and semicolons
    fireEvent.change(textarea, {
      target: { value: "Пункт 1\nПункт 2; Пункт 3\n\nПункт 4" },
    });

    // Apply bulk changes
    const applyBtn = screen.getByRole("button", { name: "Готово" });
    fireEvent.click(applyBtn);

    // Check parsed badges
    expect(screen.getByText("Пункт 1")).toBeInTheDocument();
    expect(screen.getByText("Пункт 2")).toBeInTheDocument();
    expect(screen.getByText("Пункт 3")).toBeInTheDocument();
    expect(screen.getByText("Пункт 4")).toBeInTheDocument();

    const hiddenInput = container.querySelector("input[name='features']") as HTMLInputElement;
    expect(JSON.parse(hiddenInput.value)).toEqual([
      "Пункт 1",
      "Пункт 2",
      "Пункт 3",
      "Пункт 4",
    ]);
  });

  it("synchronizes items when defaultValue prop changes", () => {
    const { container, rerender } = render(
      <ItemsArrayInput
        name="features"
        label="Пункты"
        defaultValue={JSON.stringify(["Alpha"])}
      />
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();

    rerender(
      <ItemsArrayInput
        name="features"
        label="Пункты"
        defaultValue={JSON.stringify(["Beta", "Gamma"])}
      />
    );

    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();

    const hiddenInput = container.querySelector("input[name='features']") as HTMLInputElement;
    expect(JSON.parse(hiddenInput.value)).toEqual(["Beta", "Gamma"]);
  });
});
