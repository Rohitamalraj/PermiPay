import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatUSDC(amount: bigint): string {
  return (Number(amount) / 1_000_000).toFixed(2)
}

export function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString()
}

export function formatDateTime(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleString()
}
