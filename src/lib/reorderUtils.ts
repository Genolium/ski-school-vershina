export interface OrderableItem {
  id: number;
  order?: number;
}

export interface SwapOrderResult {
  currentItem: { id: number; order: number };
  targetItem: { id: number; order: number };
}

/**
 * Вычисляет новые порядковые номера для перемещения элемента вверх/вниз в списке.
 * Корректно обрабатывает случаи с одинаковыми order, нулевыми значениями и границами списка.
 */
export function calculateSwappedOrders<T extends OrderableItem>(
  items: T[],
  currentIndex: number,
  direction: 'up' | 'down'
): SwapOrderResult | null {
  if (!items || items.length < 2) return null;
  if (currentIndex < 0 || currentIndex >= items.length) return null;

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return null;

  const current = items[currentIndex];
  const target = items[targetIndex];

  const currentOrder = current.order ?? currentIndex;
  const targetOrder = target.order ?? targetIndex;

  if (currentOrder === targetOrder) {
    // Если order одинаковые, задаем разницу в 1 единицу
    const newCurrentOrder = direction === 'up' ? targetOrder - 1 : targetOrder + 1;
    return {
      currentItem: { id: current.id, order: newCurrentOrder },
      targetItem: { id: target.id, order: targetOrder },
    };
  }

  // Обмениваем значения порядка местами
  return {
    currentItem: { id: current.id, order: targetOrder },
    targetItem: { id: target.id, order: currentOrder },
  };
}

/**
 * Сортирует элементы по order по возрастанию.
 */
export function sortByOrder<T extends OrderableItem>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export interface ReorderResult<T> {
  reorderedItems: T[];
  changedItems: { id: number; order: number }[];
}

/**
 * Пересчитывает порядок элементов при перемещении из fromIndex в toIndex (drag-and-drop).
 * Возвращает новый отсортированный массив и список элементов, чьи order изменились.
 */
export function calculateReorderedList<T extends OrderableItem>(
  items: T[],
  fromIndex: number,
  toIndex: number
): ReorderResult<T> {
  if (
    !items ||
    items.length < 2 ||
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return { reorderedItems: items || [], changedItems: [] };
  }

  const reordered = [...items];
  const [movedItem] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, movedItem);

  const changedItems: { id: number; order: number }[] = [];
  const reorderedItems = reordered.map((item, index) => {
    const newOrder = index;
    if (item.order !== newOrder) {
      changedItems.push({ id: item.id, order: newOrder });
      return { ...item, order: newOrder };
    }
    return item;
  });

  return { reorderedItems, changedItems };
}
