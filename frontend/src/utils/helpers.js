export const getMatchColor = (score) => {
  if (score > 70) return '#10b981'; // Green
  if (score >= 40) return '#f59e0b'; // Amber
  return '#9ca3af'; // Gray
};

export const getMatchLabel = (score) => {
  if (score > 70) return 'Excellent Match';
  if (score >= 40) return 'Good Match';
  return 'Partial Match';
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return formatDate(dateString);
};

export const extractTextFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      resolve(text);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
