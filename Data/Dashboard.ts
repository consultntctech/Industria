import { IYearMonth } from "@/types/Types";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const LastTwelveMonths: IYearMonth[] = (() => {
  const result: IYearMonth[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = date.getMonth(); // 0–11

    result.push({
      year: date.getFullYear(),
      month: MONTHS[monthIndex],
      id: monthIndex + 1, // Always 1–12 (Jan → Dec)
    });
  }

  return result;
})();