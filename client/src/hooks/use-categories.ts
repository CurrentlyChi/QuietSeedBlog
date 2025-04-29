import { Category } from "@shared/schema";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

export function useCategories() {
  const { data } = useQuery({
    queryKey: ["/api/categories"],
  });
  return data || [];
}

export function useCategoryOptions() {
  const categories = useCategories();
  return useMemo(() => {
    return categories.map((category: Category) => ({
      label: category.name,
      value: category.id.toString()
    }));
  }, [categories]);
}
