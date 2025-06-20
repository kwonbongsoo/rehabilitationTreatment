/**
 * 토글 상태 관리 공통 훅
 *
 * 프로젝트 전반에서 사용되는 토글 상태 패턴을 표준화
 * - 단순 boolean 토글
 * - 배열 토글 (다중 선택)
 * - 조건부 토글
 * - 토글 그룹 관리
 */

import { useCallback, useMemo, useState } from 'react';

/**
 * 기본 토글 훅
 */
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    reset,
    setValue,
  };
}

/**
 * 배열 토글 훅 (다중 선택)
 */
export function useArrayToggle<T>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);

  const toggle = useCallback((item: T) => {
    setItems((prev) => {
      const exists = prev.includes(item);
      return exists ? prev.filter((i) => i !== item) : [...prev, item];
    });
  }, []);

  const add = useCallback((item: T) => {
    setItems((prev) => (prev.includes(item) ? prev : [...prev, item]));
  }, []);

  const remove = useCallback((item: T) => {
    setItems((prev) => prev.filter((i) => i !== item));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const reset = useCallback(() => {
    setItems(initialItems);
  }, [initialItems]);

  const has = useCallback(
    (item: T) => {
      return items.includes(item);
    },
    [items],
  );

  const toggleAll = useCallback((allItems: T[]) => {
    setItems((prev) => (prev.length === allItems.length ? [] : [...allItems]));
  }, []);

  return {
    items,
    toggle,
    add,
    remove,
    clear,
    reset,
    has,
    toggleAll,
    setItems,
    isEmpty: items.length === 0,
    count: items.length,
  };
}

/**
 * 조건부 토글 훅
 */
export function useConditionalToggle(
  initialValue: boolean = false,
  condition: () => boolean = () => true,
) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    if (condition()) {
      setValue((prev) => !prev);
    }
  }, [condition]);

  const setTrue = useCallback(() => {
    if (condition()) {
      setValue(true);
    }
  }, [condition]);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue,
    canToggle: condition(),
  };
}

/**
 * 토글 그룹 훅 (라디오 버튼 스타일)
 */
export function useToggleGroup<T>(initialValue?: T) {
  const [selected, setSelected] = useState<T | undefined>(initialValue);

  const select = useCallback((value: T) => {
    setSelected(value);
  }, []);

  const toggle = useCallback((value: T) => {
    setSelected((prev) => (prev === value ? undefined : value));
  }, []);

  const clear = useCallback(() => {
    setSelected(undefined);
  }, []);

  const reset = useCallback(() => {
    setSelected(initialValue);
  }, [initialValue]);

  const isSelected = useCallback(
    (value: T) => {
      return selected === value;
    },
    [selected],
  );

  return {
    selected,
    select,
    toggle,
    clear,
    reset,
    isSelected,
    hasSelection: selected !== undefined,
  };
}

/**
 * 탭 관리 훅
 */
export function useTabs<T extends string>(initialTab: T, tabs: T[]) {
  const [activeTab, setActiveTab] = useState<T>(initialTab);

  const selectTab = useCallback(
    (tab: T) => {
      if (tabs.includes(tab)) {
        setActiveTab(tab);
      }
    },
    [tabs],
  );

  const nextTab = useCallback(() => {
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex] as T);
  }, [activeTab, tabs]);

  const prevTab = useCallback(() => {
    const currentIndex = tabs.indexOf(activeTab);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    setActiveTab(tabs[prevIndex] as T);
  }, [activeTab, tabs]);

  const isActive = useCallback(
    (tab: T) => {
      return activeTab === tab;
    },
    [activeTab],
  );

  const tabIndex = useMemo(() => {
    return tabs.indexOf(activeTab);
  }, [activeTab, tabs]);

  return {
    activeTab,
    selectTab,
    nextTab,
    prevTab,
    isActive,
    tabIndex,
    tabs,
    setActiveTab,
  };
}

/**
 * 아코디언 훅
 */
export function useAccordion(initialOpenItems: number[] = []) {
  const [openItems, setOpenItems] = useState<number[]>(initialOpenItems);

  const toggle = useCallback((index: number) => {
    setOpenItems((prev) => {
      const isOpen = prev.includes(index);
      return isOpen ? prev.filter((i) => i !== index) : [...prev, index];
    });
  }, []);

  const open = useCallback((index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev : [...prev, index]));
  }, []);

  const close = useCallback((index: number) => {
    setOpenItems((prev) => prev.filter((i) => i !== index));
  }, []);

  const closeAll = useCallback(() => {
    setOpenItems([]);
  }, []);

  const openAll = useCallback((allIndexes: number[]) => {
    setOpenItems(allIndexes);
  }, []);

  const isOpen = useCallback(
    (index: number) => {
      return openItems.includes(index);
    },
    [openItems],
  );

  return {
    openItems,
    toggle,
    open,
    close,
    closeAll,
    openAll,
    isOpen,
    setOpenItems,
  };
}

/**
 * 단일 아코디언 훅 (한 번에 하나만 열림)
 */
export function useSingleAccordion(initialOpenItem?: number) {
  const [openItem, setOpenItem] = useState<number | undefined>(initialOpenItem);

  const toggle = useCallback((index: number) => {
    setOpenItem((prev) => (prev === index ? undefined : index));
  }, []);

  const open = useCallback((index: number) => {
    setOpenItem(index);
  }, []);

  const close = useCallback(() => {
    setOpenItem(undefined);
  }, []);

  const isOpen = useCallback(
    (index: number) => {
      return openItem === index;
    },
    [openItem],
  );

  return {
    openItem,
    toggle,
    open,
    close,
    isOpen,
    setOpenItem,
    hasOpenItem: openItem !== undefined,
  };
}
