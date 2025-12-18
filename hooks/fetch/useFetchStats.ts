import { IStats, ITransactCount, ITransactMontly } from "@/types/Types"
import { useFetchProductions } from "./useFetchProductions"
import { useFetchPackages } from "./useFetchPackages";
import { useFetchSales } from "./useFetchSales";
import { useFetchOrders } from "./useFetchOrders";
import { useFetchReturns } from "./useFetchReturns";
import { getMonthlyTransactionCounts, getMonthlyTransactionSummary } from "@/lib/actions/stats.action";
import { useQuery } from "@tanstack/react-query";

export const useFetchStats = () => {
    const {productions} = useFetchProductions();
    const {packages} = useFetchPackages();
    const {sales} = useFetchSales();
    const {orders} = useFetchOrders();
    const {returns} = useFetchReturns();

    const prodAmount = productions.reduce(
        (acc, curr) => acc + ((curr.productionCost ?? 0) + (curr.extraCost ?? 0)),
        0
    );

    const pkAmount = packages.reduce(
        (acc, curr) => acc + (curr.cost ?? 0),
        0
    );
    const salesAmount = sales.reduce(
        (acc, curr) => acc + (curr.price ?? 0),
        0
    );

    const orderAmount = orders.reduce(
        (acc, curr) => acc + (curr.price ?? 0),
        0
    );

    const returnAmount = returns.reduce(
        (acc, curr) => acc + (curr.price ?? 0),
        0
    );
    const stats:IStats = {
        totalSales: sales.length,
        totalSalesAmount: salesAmount,
        totalOrders: orders.length,
        totalOrdersAmount: orderAmount,
        totalReturns: returns.length,
        totalReturnsAmount: returnAmount,
        totalProductions: productions.length,
        totalProductionsAmount: prodAmount,
        totalPackaging: packages.length,
        totalPackagingAmount: pkAmount,
    }
    return {stats};
}



export const useFetchTransactMonthly = (month?:number, year?:number, type?:"quantity" | "price") => {
    const fetchStats = async():Promise<ITransactMontly | null> => {
        try {
            const res = await getMonthlyTransactionSummary(month, year, type);
            const data = res.payload as ITransactMontly;
            return data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    const {data:transactMontly, isPending, refetch, isSuccess} = useQuery({
        queryKey: ['transactMontly', month, year, type],
        queryFn: fetchStats,
    })
    return {transactMontly, isPending, refetch, isSuccess}
}



export const useFetchMonthlyTransactionCounts = () => {
    const fetchMonthlyTransactionCounts = async ():Promise<ITransactCount | null> => {
        try {
            const res = await getMonthlyTransactionCounts();
            const data = res.payload as ITransactCount;
            return data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
  
  
  const {data:transactCount, isPending, refetch, isSuccess} = useQuery({
    queryKey: ['monthlyTransactionCounts'],
    queryFn: fetchMonthlyTransactionCounts,
  })
  return {transactCount, isPending, refetch, isSuccess}
}