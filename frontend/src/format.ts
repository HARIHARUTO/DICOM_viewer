export const formatDicomDate = (value: string | null): string => {
  if (!value || !/^\d{8}$/.test(value)) {
    return 'Unknown date';
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
};

export const formatDicomTime = (value: string | null): string => {
  if (!value) {
    return '';
  }

  const normalized = value.replace(/\D/g, '').padEnd(6, '0');
  return `${normalized.slice(0, 2)}:${normalized.slice(2, 4)}:${normalized.slice(4, 6)}`;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

