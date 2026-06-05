export function initialsOf(author: string): string {
  const words = author.trim().split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) {
    return '?';
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function relativeTime(at: string, nowMs: number): string {
  const parsed = Date.parse(at);
  if (Number.isNaN(parsed)) {
    return at;
  }
  const seconds = Math.max(0, Math.round((nowMs - parsed) / 1000));
  if (seconds < 60) {
    return 'just now';
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.round(hours / 24);
  if (days < 7) {
    return `${days}d`;
  }
  return `${Math.round(days / 7)}w`;
}
