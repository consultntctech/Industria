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





export function getLast7Months(): { key: string; label: string }[] {
    const months: { key: string; label: string }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = d.toLocaleString('en', { month: 'short' });
        const year = d.getFullYear();
        months.push({
            key: `${year}-${d.getMonth() + 1}`,
            label: `${month} ${year}`,
        });
    }
    return months;
}

export function getLast7Weeks(): string[] {
    const weeks: string[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);

        // ISO week calculation
        const temp = new Date(d);
        temp.setHours(0, 0, 0, 0);
        temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));

        const isoYear = temp.getFullYear();
        const week1 = new Date(isoYear, 0, 4);
        const isoWeek =
            1 +
            Math.round(
                ((temp.getTime() - week1.getTime()) / 86400000 -
                    3 +
                    ((week1.getDay() + 6) % 7)) /
                    7
            );

        weeks.push(`${isoYear}W${isoWeek}`);
    }

    return weeks;
}


export function getLast7Days(): string[] {
    const days: string[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleString('en', { weekday: 'short' }));
    }
    return days;
}


export async function hasPassedOneHour(
  input: Date | string
): Promise<boolean> {
  const date =
    input instanceof Date ? input : new Date(input);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date input');
  }

  const ONE_HOUR_MS = 60 * 60 * 1000;
  return Date.now() - date.getTime() >= ONE_HOUR_MS;
}
