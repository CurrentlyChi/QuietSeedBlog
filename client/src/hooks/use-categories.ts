import { categories } from "@shared/schema";
import { useMemo } from "react";

export function useCategories() {
  return useMemo(() => categories, []);
}

export function useCategoryOptions() {
  return useMemo(() => {
    return categories.map(category => ({
      label: category,
      value: category
    }));
  }, []);
}
