
export const formatViewCount = (count) => {
  if (!count) return "0";
  const num = parseInt(count);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};


export const formatSubscriberCount = (count) => {
  if (!count) return "0";
  const num = parseInt(count);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};