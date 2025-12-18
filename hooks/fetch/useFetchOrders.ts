import { getOrders, getOrdersGroupedByMonth, getOrdersQuantityGroupedByMonth, getOrderStats, getTodayOrders } from "@/lib/actions/order.action";
import { IOrder } from "@/lib/models/order.model"
import { IMonthlyStats, IOrderStats } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";

export const useFetchOrders = (isToday?:boolean) => {
    const fetchOrders = async ():Promise<IOrder[]> => {
        try {
            const res =  isToday ? await getTodayOrders() : await getOrders();
            const data = res.payload as IOrder[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:orders=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['orders', isToday],
        queryFn: fetchOrders,
    })

    return {orders, isPending, refetch, isSuccess}
}



export const useFetchOrdersByMonth = () => {
    const fetchOrders = async ():Promise<IMonthlyStats[]> => {
        try {
            const res = await getOrdersGroupedByMonth();
            const data = res.payload as IMonthlyStats[];
            return data.slice(-6);
        } catch (error) {
            console.log(error);
            return [];
        }
    }
  
  const {data:orders=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['ordersbymonth'],
    queryFn: fetchOrders,
  })
  return {orders, isPending, refetch, isSuccess}
}


export const useFetchOrdersQuantityByMonth = () => {
    const fetchOrders = async ():Promise<IMonthlyStats[]> => {
        try {
            const res = await getOrdersQuantityGroupedByMonth();
            const data = res.payload as IMonthlyStats[];
            return data;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

  const {data:orders=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['ordersquantitybymonth'],
    queryFn: fetchOrders,
  })
  return {orders, isPending, refetch, isSuccess}
}


export const useFetchOrderStats = () => {
    const fetchOrderStats = async ():Promise<IOrderStats | null> => {
        try {
            const res = await getOrderStats();
            const data = res.payload as IOrderStats;
            return data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
  
  
  const {data:orderStats, isPending, refetch, isSuccess} = useQuery({
    queryKey: ['alltimeorderstats'],
    queryFn: fetchOrderStats,
  })
  return {orderStats, isPending, refetch, isSuccess}
}