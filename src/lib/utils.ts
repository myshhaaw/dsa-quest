import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  BOSS: 'Boss Battle',
};

export const DIFFICULTY_COLOR: Record<string, string> = {
  EASY: 'text-verdant-400 border-verdant-500/40 bg-verdant-500/10',
  MEDIUM: 'text-ember-400 border-ember-500/40 bg-ember-500/10',
  HARD: 'text-ember_red-400 border-ember_red-500/40 bg-ember_red-500/10',
  BOSS: 'text-arcane-400 border-arcane-500/40 bg-arcane-500/10',
};

export function timeAgo(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}
