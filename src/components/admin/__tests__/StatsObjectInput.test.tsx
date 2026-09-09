import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatsObjectInput } from "../StatsObjectInput";

describe("StatsObjectInput Component", () => {
  it("renders with label, known fields initialized from defaultValue, and serialized hidden input", () => {
    const initialJson = JSON.stringify({
      camps_count: "5",
      participants: "80+",
      recommend_rate: "100%",
    });

    const { container } = render(
      <StatsObjectInput
        id="camps-stats"
        name="stats"
        label="Статистика сборов"
        defaultValue={initialJson}
      />
    );

    expect(screen.getByText("Статистика сборов")).toBeInTheDocument();

    const campsInput = screen.getByLabelText("Количество сборов") as HTMLInputElement;
    const participantsInput = screen.getByLabelText("Участников сборов") as HTMLInputElement;
    const recommendInput = screen.getByLabelText("Рекомендуют родителей") as HTMLInputElement;

    expect(campsInput.value).toBe("5");
    expect(participantsInput.value).toBe("80+");
    expect(recommendInput.value).toBe("100%");

    const hiddenInput = container.querySelector("input[name='stats']") as HTMLInputElement;
    expect(JSON.parse(hiddenInput.value)).toEqual({
      camps_count: "5",
      participants: "80+",
      recommend_rate: "100%",
    });
  });

  it("updates known fields and updates hidden input JSON", () => {
    const { container } = render(
      <StatsObjectInput
        name="stats"
        label="Статистика"
        defaultValue="{}"
      />
    );

    const campsInput = screen.getByLabelText("Количество сборов");
    const participantsInput = screen.getByLabelText("Участников сборов");

    fireEvent.change(campsInput, { target: { value: "8" } });
    fireEvent.change(participantsInput, { target: { value: "120+" } });

    const hiddenInput = container.querySelector("input[name='stats']") as HTMLInputElement;
    const parsed = JSON.parse(hiddenInput.value);

    expect(parsed.camps_count).toBe("8");
    expect(parsed.participants).toBe("120+");
  });

  it("adds custom metric key/value pair and removes it with delete button", () => {
    const { container } = render(
      <StatsObjectInput
        name="stats"
        label="Статистика"
        defaultValue="{}"
      />
    );

    const keyInput = screen.getByPlaceholderText("Название метрики...");
    const valInput = screen.getByPlaceholderText("Значение...");
    const addBtn = screen.getByRole("button", { name: /Добавить/i });

    expect(addBtn).toBeDisabled();

    fireEvent.change(keyInput, { target: { value: "trainers_count" } });
    fireEvent.change(valInput, { target: { value: "12" } });
    expect(addBtn).not.toBeDisabled();

    fireEvent.click(addBtn);

    // Custom metric should appear in list
    expect(screen.getByText("trainers_count:")).toBeInTheDocument();
    expect(keyInput).toHaveValue("");
    expect(valInput).toHaveValue("");

    let hiddenInput = container.querySelector("input[name='stats']") as HTMLInputElement;
    expect(JSON.parse(hiddenInput.value)).toEqual({ trainers_count: "12" });

    // Remove the custom metric with Trash button
    const removeBtn = screen.getByRole("button", { name: "" }); // icon button has no accessible name or find by svg/class
    fireEvent.click(removeBtn);

    expect(screen.queryByText("trainers_count:")).not.toBeInTheDocument();

    hiddenInput = container.querySelector("input[name='stats']") as HTMLInputElement;
    expect(JSON.parse(hiddenInput.value)).toEqual({});
  });

  it("switches to raw JSON mode, allows editing JSON string, and synchronizes back", () => {
    const { container } = render(
      <StatsObjectInput
        name="stats"
        label="Статистика"
        defaultValue={JSON.stringify({ camps_count: "3" })}
      />
    );

    // Switch to JSON mode
    const toggleModeBtn = screen.getByRole("button", { name: /JSON режим/i });
    fireEvent.click(toggleModeBtn);

    expect(screen.getByRole("button", { name: /Удобный конструктор/i })).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/camps_count/i) as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(JSON.parse(textarea.value)).toEqual({ camps_count: "3" });

    // Edit JSON in textarea
    const newJson = JSON.stringify({ camps_count: "15", participants: "300" });
    fireEvent.change(textarea, { target: { value: newJson } });

    // Switch back to builder mode
    const backBtn = screen.getByRole("button", { name: /Удобный конструктор/i });
    fireEvent.click(backBtn);

    const campsInput = screen.getByLabelText("Количество сборов") as HTMLInputElement;
    const participantsInput = screen.getByLabelText("Участников сборов") as HTMLInputElement;

    expect(campsInput.value).toBe("15");
    expect(participantsInput.value).toBe("300");

    const hiddenInput = container.querySelector("input[name='stats']") as HTMLInputElement;
    expect(JSON.parse(hiddenInput.value)).toEqual({ camps_count: "15", participants: "300" });
  });

  it("synchronizes when defaultValue prop changes", () => {
    const { container, rerender } = render(
      <StatsObjectInput
        name="stats"
        label="Статистика"
        defaultValue={JSON.stringify({ camps_count: "1" })}
      />
    );

    expect(screen.getByDisplayValue("1")).toBeInTheDocument();

    rerender(
      <StatsObjectInput
        name="stats"
        label="Статистика"
        defaultValue={JSON.stringify({ camps_count: "9", participants: "150" })}
      />
    );

    expect(screen.getByDisplayValue("9")).toBeInTheDocument();
    expect(screen.getByDisplayValue("150")).toBeInTheDocument();

    const hiddenInput = container.querySelector("input[name='stats']") as HTMLInputElement;
    expect(JSON.parse(hiddenInput.value)).toEqual({ camps_count: "9", participants: "150" });
  });
});
