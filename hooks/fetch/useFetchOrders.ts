import { isSystemAdmin } from "@/Data/roles/permissions";
import { getOrders, getOrdersByOrg, getOrdersByOrgGroupedByMonth, getOrdersByOrgQuantityGroupedByMonth, getOrdersGroupedByMonth, getOrdersQuantityGroupedByMonth, getOrderStats, getOrderStatsByOrg, getTodayOrders, getTodayOrdersByOrg } from "@/lib/actions/order.action";
import { IOrder } from "@/lib/models/order.model"
import { IMonthlyStats, IOrderStats } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";

export const useFetchOrders = (isToday?:boolean) => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchOrders = async ():Promise<IOrder[]> => {
        try {
            if(!user) return [];
            let res;
            if(isAdmin){
                res =  isToday ? await getTodayOrders() : await getOrders();
            }else{
                res = isToday ? await getTodayOrdersByOrg(user?.org) : await getOrdersByOrg(user?.org);
            }
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
        enabled: !!user
    })

    return {orders, isPending, refetch, isSuccess}
}



export const useFetchOrdersByMonth = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchOrders = async ():Promise<IMonthlyStats[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getOrdersGroupedByMonth() : await getOrdersByOrgGroupedByMonth(user?.org);
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
    enabled: !!user
  })
  return {orders, isPending, refetch, isSuccess}
}


export const useFetchOrdersQuantityByMonth = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchOrders = async ():Promise<IMonthlyStats[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getOrdersQuantityGroupedByMonth() : await getOrdersByOrgQuantityGroupedByMonth(user?.org);
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
    enabled: !!user
  })
  return {orders, isPending, refetch, isSuccess}
}


export const useFetchOrderStats = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchOrderStats = async ():Promise<IOrderStats | null> => {
        try {
            if(!user) return null;
            const res = isAdmin ? await getOrderStats() : await getOrderStatsByOrg(user?.org);
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
    enabled: !!user
  })
  return {orderStats, isPending, refetch, isSuccess}
}