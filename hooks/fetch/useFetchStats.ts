import { IStats } from "@/types/Types"
import { useFetchProductions } from "./useFetchProductions"
import { useFetchPackages } from "./useFetchPackages";
import { useFetchSales } from "./useFetchSales";
import { useFetchOrders } from "./useFetchOrders";
import { useFetchReturns } from "./useFetchReturns";

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