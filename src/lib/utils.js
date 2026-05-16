import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// This function combines CSS class names together neatly
// It handles conflicting Tailwind classes by keeping the last one
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
