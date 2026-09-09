import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, createEvent } from "@testing-library/react";
import { DraggableTableRow, DragHandle } from "../DraggableTableRow";
import { Table, TableBody, TableCell } from "@/components/ui/table";

describe("DraggableTableRow & DragHandle Component", () => {
  it("renders table row and drag handle with GripVertical icon", () => {
    const onReorder = vi.fn();

    render(
      <Table>
        <TableBody>
          <DraggableTableRow index={0} onReorder={onReorder}>
            <TableCell>
              <DragHandle />
            </TableCell>
            <TableCell>Тариф Тест</TableCell>
          </DraggableTableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByTestId("draggable-row-0")).toBeInTheDocument();
    expect(screen.getByTestId("drag-handle")).toBeInTheDocument();
    expect(screen.getByText("Тариф Тест")).toBeInTheDocument();
  });

  it("handles dragStart and sets transfer data with row index", () => {
    const onReorder = vi.fn();

    render(
      <Table>
        <TableBody>
          <DraggableTableRow index={1} onReorder={onReorder}>
            <TableCell>Row 1</TableCell>
          </DraggableTableRow>
        </TableBody>
      </Table>
    );

    const row = screen.getByTestId("draggable-row-1");

    const setData = vi.fn();
    fireEvent.dragStart(row, {
      dataTransfer: {
        setData,
        effectAllowed: "",
      },
    });

    expect(setData).toHaveBeenCalledWith("text/plain", "1");
  });

  it("handles dragOver and visual drop indicator positioning (top/bottom)", () => {
    const onReorder = vi.fn();

    render(
      <Table>
        <TableBody>
          <DraggableTableRow index={0} onReorder={onReorder}>
            <TableCell>Row 0</TableCell>
          </DraggableTableRow>
        </TableBody>
      </Table>
    );

    const row = screen.getByTestId("draggable-row-0");
    vi.spyOn(window.Element.prototype, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 200,
      height: 100,
      left: 0,
      right: 500,
      width: 500,
      x: 0,
      y: 100,
      toJSON: () => {},
    });

    // Hover on upper half (clientY = 120 < midY 150) -> border-t-2
    const dragOverTop = createEvent.dragOver(row);
    Object.defineProperty(dragOverTop, "clientY", { value: 120 });
    Object.defineProperty(dragOverTop, "dataTransfer", { value: { dropEffect: "" } });
    fireEvent(row, dragOverTop);
    expect(row.className).toContain("border-t-2");

    // Hover on lower half (clientY = 180 > midY 150) -> border-b-2
    const dragOverBottom = createEvent.dragOver(row);
    Object.defineProperty(dragOverBottom, "clientY", { value: 180 });
    Object.defineProperty(dragOverBottom, "dataTransfer", { value: { dropEffect: "" } });
    fireEvent(row, dragOverBottom);
    expect(row.className).toContain("border-b-2");
  });

  it("calls onReorder with fromIndex and toIndex when drop occurs", () => {
    const onReorder = vi.fn();

    render(
      <Table>
        <TableBody>
          <DraggableTableRow index={2} onReorder={onReorder}>
            <TableCell>Row 2</TableCell>
          </DraggableTableRow>
        </TableBody>
      </Table>
    );

    const row = screen.getByTestId("draggable-row-2");

    fireEvent.drop(row, {
      dataTransfer: {
        getData: (type: string) => (type === "text/plain" ? "0" : ""),
      },
    });

    expect(onReorder).toHaveBeenCalledWith(0, 2);
  });

  it("ignores drop if dropped on the same index", () => {
    const onReorder = vi.fn();

    render(
      <Table>
        <TableBody>
          <DraggableTableRow index={1} onReorder={onReorder}>
            <TableCell>Row 1</TableCell>
          </DraggableTableRow>
        </TableBody>
      </Table>
    );

    const row = screen.getByTestId("draggable-row-1");

    fireEvent.drop(row, {
      dataTransfer: {
        getData: (type: string) => (type === "text/plain" ? "1" : ""),
      },
    });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it("respects disabled prop and does not initiate drag when disabled", () => {
    const onReorder = vi.fn();

    render(
      <Table>
        <TableBody>
          <DraggableTableRow index={0} onReorder={onReorder} disabled={true}>
            <TableCell>
              <DragHandle disabled={true} />
            </TableCell>
          </DraggableTableRow>
        </TableBody>
      </Table>
    );

    const row = screen.getByTestId("draggable-row-0");
    const setData = vi.fn();

    fireEvent.dragStart(row, {
      dataTransfer: { setData },
    });

    expect(setData).not.toHaveBeenCalled();
    expect(screen.getByTestId("drag-handle").className).toContain("opacity-30");
  });
});
