import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItemsArrayInput } from "../ItemsArrayInput";
import { StatsObjectInput } from "../StatsObjectInput";

describe("SmartInputs - ItemsArrayInput & StatsObjectInput", () => {
  describe("ItemsArrayInput", () => {
    it("parses raw semicolon string defaultValue and renders item badges", () => {
      const raw = '"Проживание"; "Питание"; "3 тренировки в день";';
      render(
        <ItemsArrayInput
          id="features"
          name="features"
          label="Особенности"
          defaultValue={raw}
        />
      );

      expect(screen.getByText("Проживание")).toBeInTheDocument();
      expect(screen.getByText("Питание")).toBeInTheDocument();
      expect(screen.getByText("3 тренировки в день")).toBeInTheDocument();

      const hiddenInput = document.querySelector('input[name="features"]') as HTMLInputElement;
      expect(hiddenInput).toBeInTheDocument();
      expect(JSON.parse(hiddenInput.value)).toEqual([
        "Проживание",
        "Питание",
        "3 тренировки в день",
      ]);
    });

    it("adds a new item via input and Enter key", async () => {
      const user = userEvent.setup();
      render(
        <ItemsArrayInput
          name="features"
          label="Особенности"
          defaultValue='["Пункт 1"]'
        />
      );

      const input = screen.getByPlaceholderText("Введите пункт и нажмите Enter...");
      await user.type(input, "Пункт 2{enter}");

      expect(screen.getByText("Пункт 2")).toBeInTheDocument();
      const hiddenInput = document.querySelector('input[name="features"]') as HTMLInputElement;
      expect(JSON.parse(hiddenInput.value)).toEqual(["Пункт 1", "Пункт 2"]);
    });

    it("adds items from presets and removes an item", async () => {
      const user = userEvent.setup();
      render(
        <ItemsArrayInput
          name="features"
          label="Особенности"
          defaultValue="[]"
          presets={["Раздевалки", "Ски-пасс"]}
        />
      );

      const presetBtn = screen.getByRole("button", { name: /Раздевалки/i });
      await user.click(presetBtn);

      expect(screen.getAllByText("Раздевалки").length).toBe(2);

      // Remove item
      const deleteBtn = screen.getByTitle("Удалить");
      await user.click(deleteBtn);

      expect(screen.getAllByText("Раздевалки").length).toBe(1);
    });

    it("switches to bulk text mode, modifies lines, and applies", async () => {
      const user = userEvent.setup();
      render(
        <ItemsArrayInput
          name="features"
          label="Особенности"
          defaultValue='["Старый пункт"]'
        />
      );

      // Open bulk mode
      const bulkToggle = screen.getByRole("button", { name: /Списком \/ Текстом/i });
      await user.click(bulkToggle);

      const textarea = screen.getByPlaceholderText(/Введите каждый пункт с новой строки/i);
      await user.clear(textarea);
      await user.type(textarea, "Новый 1\nНовый 2");

      const applyBtn = screen.getByRole("button", { name: /Готово/i });
      await user.click(applyBtn);

      expect(screen.getByText("Новый 1")).toBeInTheDocument();
      expect(screen.getByText("Новый 2")).toBeInTheDocument();
      expect(screen.queryByText("Старый пункт")).not.toBeInTheDocument();
    });
  });

  describe("StatsObjectInput", () => {
    it("renders default JSON stats into structured inputs", () => {
      const defaultValue = '{"camps_count": "5", "participants": "80+"}';
      render(
        <StatsObjectInput
          name="stats"
          label="Статистика"
          defaultValue={defaultValue}
        />
      );

      const campsInput = screen.getByDisplayValue("5") as HTMLInputElement;
      const participantsInput = screen.getByDisplayValue("80+") as HTMLInputElement;
      expect(campsInput).toBeInTheDocument();
      expect(participantsInput).toBeInTheDocument();

      const hiddenInput = document.querySelector('input[name="stats"]') as HTMLInputElement;
      expect(JSON.parse(hiddenInput.value)).toEqual({
        camps_count: "5",
        participants: "80+",
      });
    });

    it("allows updating a field and reflects in hidden JSON input", () => {
      render(
        <StatsObjectInput
          name="stats"
          label="Статистика"
          defaultValue='{"camps_count": "5"}'
        />
      );

      const campsInput = screen.getByDisplayValue("5");
      fireEvent.change(campsInput, { target: { value: "10" } });

      const hiddenInput = document.querySelector('input[name="stats"]') as HTMLInputElement;
      expect(JSON.parse(hiddenInput.value)).toEqual({
        camps_count: "10",
      });
    });

    it("allows adding custom key-value metrics and removing them", async () => {
      const user = userEvent.setup();
      render(
        <StatsObjectInput
          name="stats"
          label="Статистика"
          defaultValue="{}"
        />
      );

      const keyInput = screen.getByPlaceholderText("Название метрики...");
      const valInput = screen.getByPlaceholderText("Значение...");
      const addBtn = screen.getByRole("button", { name: /Добавить/i });

      await user.type(keyInput, "medals");
      await user.type(valInput, "15");
      await user.click(addBtn);

      expect(screen.getByText("medals:")).toBeInTheDocument();
      expect(screen.getByDisplayValue("15")).toBeInTheDocument();

      const hiddenInput = document.querySelector('input[name="stats"]') as HTMLInputElement;
      expect(JSON.parse(hiddenInput.value)).toEqual({
        medals: "15",
      });
    });

    it("toggles raw JSON mode and updates correctly", async () => {
      const user = userEvent.setup();
      render(
        <StatsObjectInput
          name="stats"
          label="Статистика"
          defaultValue='{"camps_count": "5"}'
        />
      );

      const toggleBtn = screen.getByRole("button", { name: /JSON режим/i });
      await user.click(toggleBtn);

      const textarea = screen.getByPlaceholderText('{"camps_count": "5", "participants": "80+"}');
      expect(textarea).toBeInTheDocument();

      // Switch back
      const builderBtn = screen.getByRole("button", { name: /Удобный конструктор/i });
      await user.click(builderBtn);

      expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    });
  });
});
