export const today = () => {
    const date = new Date();
    return date.toISOString().split("T")[0];
}


export const formatDate = (d?: string | Date) =>
  d ? new Date(d).toISOString().split('T')[0] : "";


export function formatTimestamp(ts: string): string {
  const date = new Date(ts);

  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;

  return `${mm}/${dd}/${yy} ${hours}:${minutes} ${ampm}`;
}
