import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 * This allows for conditional and dynamic class names with proper merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
