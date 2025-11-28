import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ellipseMiddle(
  target: string | null,
  charsStart = 5,
  charsEnd = 5
): string {
  if (!target) {
    return "";
  }
  return `${target.slice(0, charsStart)}...${target.slice(
    target.length - charsEnd
  )}`;
}

export function getRefuelFeeBps(amount: number) {
  return amount <= 10 ? 100 : amount <= 50 ? 50 : 20;
}

export function isSameAddress(address1: string, address2: string) {
  return address1.toLowerCase() === address2.toLowerCase();
}
