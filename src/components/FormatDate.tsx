export function formatDate(date: any) {
  const options = { day: "numeric", month: "long" };
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dayMonth = date.toLocaleDateString(undefined, options);
  return `${dayMonth} at ${time}`;
}
