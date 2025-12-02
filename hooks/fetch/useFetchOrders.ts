import { getOrders, getTodayOrders } from "@/lib/actions/order.action";
import { IOrder } from "@/lib/models/order.model"
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