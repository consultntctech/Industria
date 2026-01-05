import { TableData } from "@/Data/roles/table";
import { ILineItem } from "@/lib/models/lineitem.model";
import { IOrder } from "@/lib/models/order.model";
import { IProduct } from "@/lib/models/product.model";
import { IRole } from "@/lib/models/role.model";
import { INavBarItem } from "@/types/NavBar.types";
import { IOperation, ISoldItem } from "@/types/Types";

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



export function isDeadlinePast(order: IOrder): boolean {
    if (!order.deadline) return true;
    return new Date(order.deadline).getTime() < new Date(order.fulfilledAt).getTime();
}

export function compareLastTwoOrders(orders: number[]): string {
  if (!orders || orders.length === 0) {
    return "No data available";
  }

  if (orders.length === 1) {
    return `Only 1 order so far`;
  }

  const previous = orders.at(-2);
  const current = orders.at(-1);

  if (!previous || !current) {
    return "Not enough data to compare";
  }

  // Both zero
  if (previous === 0 && current === 0) {
    return "No change from last month";
  }

  // Prevent division by zero
  if (previous === 0) {
    return current > 0
      ? "100% more than last month"
      : "No change from last month";
  }

  const percentageChange = ((current - previous) / previous) * 100;
  const rounded = Math.abs(Math.round(percentageChange));

  if (percentageChange > 0) {
    return `${rounded}% more than last month`;
  }

  if (percentageChange < 0) {
    return `${rounded}% less than last month`;
  }

  return "No change from last month";
}



export const getRoleTitles = (role:IRole|null):string[]=>{
  if(!role) return [];
  const table = TableData.find(t=>t.id===role.permissions?.tableid);
  const operations = role.permissions?.operations as IOperation[];
  // console.log('Operations: ', operations)
  return operations.map(op=>`${table?.name} ${op.title}`);
}


export function normalizeAndGroup(
  sales: number[],
  orders: number[],
  returns: number[]
): number[][] {
  const maxLength = Math.max(sales.length, orders.length, returns.length);

  const normalizedSales = [...sales, ...Array(maxLength - sales.length).fill(0)];
  const normalizedOrders = [...orders, ...Array(maxLength - orders.length).fill(0)];
  const normalizedReturns = [
    ...returns.map(r => -Math.abs(r)),
    ...Array(maxLength - returns.length).fill(0),
  ];

  return Array.from({ length: maxLength }, (_, i) => [
    normalizedSales[i],
    normalizedOrders[i],
    normalizedReturns[i],
  ]);
}



export function getISOWeek(date: Date): number {
  const tmp = new Date(date);
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((tmp.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

export function getISOWeekYear(date: Date): number {
  const tmp = new Date(date);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  return tmp.getFullYear();
}



type FlatNavItem = {
  item: INavBarItem;
  parentId: string | null;
};

export const flattenNav = (links: INavBarItem[]): FlatNavItem[] => {
  const result: FlatNavItem[] = [];

  for (const item of links) {
    if (item.link) {
      result.push({ item, parentId: null });
    }

    if (item.subMenu) {
      for (const sub of item.subMenu) {
        result.push({ item: sub, parentId: item.id });
      }
    }
  }

  return result;
};



type PasswordResetResult = {
  error: boolean;
  message: string;
};

export function validatePasswordReset(
  password: string,
  password1: string
): PasswordResetResult {
  if (!password || !password1) {
    return {
      error: true,
      message: 'Password fields are required'
    };
  }

  if (password !== password1) {
    return {
      error: true,
      message: 'Passwords do not match'
    };
  }

  if (password.length < 8) {
    return {
      error: true,
      message: 'Password must be at least 8 characters long'
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      error: true,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      error: true,
      message: 'Password must contain at least one number'
    };
  }

  return {
    error: false,
    message: 'Password is valid'
  };
}
