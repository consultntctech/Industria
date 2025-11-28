import { ILineItem } from "@/lib/models/lineitem.model";
import { IProduct } from "@/lib/models/product.model";
import { ISoldItem } from "@/types/Types";

export function generatePassword(length: number): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const allChars = upper + lower + numbers;

  if (length < 3) {
    throw new Error("Password length must be at least 3 to include all character types.");
  }

  // Ensure at least one of each type
  let password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
  ];

  // Fill remaining characters randomly
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle characters for randomness
  return password
    .sort(() => Math.random() - 0.5)
    .join("");
}



export function arraysEqual(a:string[], b:string[]) {
    if (a.length !== b.length) return false;
    return [...a].sort().join() === [...b].sort().join();
}



export function getProductCounts(items: ILineItem[]):ISoldItem[] {
  const counts = new Map<string, { name: string; quantity: number }>();

  for (const item of items) {
    const product = item.product as IProduct; // fully populated

    if (!counts.has(product._id)) {
      counts.set(product._id, {
        name: product.name,
        quantity: 1
      });
    } else {
      counts.get(product._id)!.quantity++;
    }
  }

  return Array.from(counts, ([id, data]) => ({
    id,
    name: data.name,
    quantity: data.quantity
  }));
}
