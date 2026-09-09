import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast, toast, reducer } from "../use-toast";

describe("useToast hook and toast utility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Dismiss all toasts and advance timers
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.dismiss();
    });
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  it("toast({ title, description }) creates toast state", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({
        title: "Test",
        description: "Desc",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Test");
    expect(result.current.toasts[0].description).toBe("Desc");
    expect(result.current.toasts[0].open).toBe(true);
    expect(result.current.toasts[0].id).toBeDefined();
  });

  it("dismiss() removes toast", () => {
    const { result } = renderHook(() => useToast());

    let toastHandle: ReturnType<typeof toast>;
    act(() => {
      toastHandle = toast({
        title: "Dismiss Test",
        description: "Will be dismissed",
      });
    });

    expect(result.current.toasts[0].open).toBe(true);

    // Call dismiss on handle
    act(() => {
      toastHandle.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);

    // After delay, toast is completely removed from state
    act(() => {
      vi.advanceTimersByTime(1000000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("dismiss(toastId) via hook dismisses specific toast", () => {
    const { result } = renderHook(() => useToast());

    let createdId = "";
    act(() => {
      const t = toast({ title: "Toast 1", description: "Desc 1" });
      createdId = t.id;
    });

    expect(result.current.toasts[0].id).toBe(createdId);
    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      result.current.dismiss(createdId);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it("dismiss() without arguments dismisses all toasts", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "Toast A" });
    });

    expect(result.current.toasts[0].open).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it("update() updates toast properties", () => {
    const { result } = renderHook(() => useToast());

    let toastHandle: ReturnType<typeof toast>;
    act(() => {
      toastHandle = toast({
        title: "Initial Title",
        description: "Initial Desc",
      });
    });

    act(() => {
      toastHandle.update({
        id: toastHandle.id,
        title: "Updated Title",
        description: "Updated Desc",
      });
    });

    expect(result.current.toasts[0].title).toBe("Updated Title");
    expect(result.current.toasts[0].description).toBe("Updated Desc");
  });

  it("enforces TOAST_LIMIT = 1 by replacing previous toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "First Toast" });
    });
    expect(result.current.toasts[0].title).toBe("First Toast");

    act(() => {
      toast({ title: "Second Toast" });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe("Second Toast");
  });

  it("onOpenChange(false) dismisses the toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "Auto dismiss test" });
    });

    const activeToast = result.current.toasts[0];
    expect(activeToast.open).toBe(true);

    act(() => {
      activeToast.onOpenChange?.(false);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });
});

describe("toast reducer unit tests", () => {
  it("handles ADD_TOAST action", () => {
    const initialState = { toasts: [] };
    const newToast = { id: "1", title: "Hello", open: true };
    const nextState = reducer(initialState, {
      type: "ADD_TOAST",
      toast: newToast,
    });

    expect(nextState.toasts).toHaveLength(1);
    expect(nextState.toasts[0]).toEqual(newToast);
  });

  it("handles UPDATE_TOAST action", () => {
    const initialState = {
      toasts: [{ id: "1", title: "Original", open: true }],
    };
    const nextState = reducer(initialState, {
      type: "UPDATE_TOAST",
      toast: { id: "1", title: "Modified" },
    });

    expect(nextState.toasts[0].title).toBe("Modified");
    expect(nextState.toasts[0].open).toBe(true);
  });

  it("handles DISMISS_TOAST action for specific id", () => {
    const initialState = {
      toasts: [{ id: "1", title: "Toast 1", open: true }],
    };
    const nextState = reducer(initialState, {
      type: "DISMISS_TOAST",
      toastId: "1",
    });

    expect(nextState.toasts[0].open).toBe(false);
  });

  it("handles REMOVE_TOAST action for specific id and all", () => {
    const initialState = {
      toasts: [
        { id: "1", title: "Toast 1", open: false },
        { id: "2", title: "Toast 2", open: false },
      ],
    };

    const stateAfterRemoveOne = reducer(initialState, {
      type: "REMOVE_TOAST",
      toastId: "1",
    });
    expect(stateAfterRemoveOne.toasts).toHaveLength(1);
    expect(stateAfterRemoveOne.toasts[0].id).toBe("2");

    const stateAfterRemoveAll = reducer(stateAfterRemoveOne, {
      type: "REMOVE_TOAST",
      toastId: undefined,
    });
    expect(stateAfterRemoveAll.toasts).toHaveLength(0);
  });
});
