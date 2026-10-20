import { getLastSixMonthsSalesByOrg, getSalesByOrg, getSalesGroupedByMonthByOrg, getSalesQuantityGroupedByMonthByOrg, getTodaySalesByOrg } from "@/lib/actions/sales.action";
import { ISales } from "@/lib/models/sales.model"
import { IMonthlyStats } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";

export const useFetchSales = (isToday?: boolean) => {
    const {user} = useAuth();
    const fetchSales = async ():Promise<ISales[]> => {
        try {
            if(!user) return [];
           
            const res = isToday ?  await getTodaySalesByOrg(user?.org) : await getSalesByOrg(user?.org);
            const data = res.payload as ISales[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }


    const {data:sales=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['allsales', isToday],
        queryFn: fetchSales,
        enabled: !!user
    })
    return {sales, isPending, refetch, isSuccess}
}


export const useFetchSixMonthsSales = () => {
    const {user} = useAuth();
    const fetchSales = async ():Promise<IMonthlyStats[]> => {
        try {
            if(!user) return [];
            const res = await getLastSixMonthsSalesByOrg(user?.org);
            const data = res.payload as IMonthlyStats[];
            return data;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:sales=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['sixmonthssales'],
        queryFn: fetchSales,
        enabled: !!user
    })
    return {sales, isPending, refetch, isSuccess}
}


export const useFetchSalesByMonth = () => {
    const {user} = useAuth();
    const fetchSales = async ():Promise<IMonthlyStats[]> => {
        try {
            if(!user) return [];
            const res = await getSalesGroupedByMonthByOrg(user?.org);
            const data = res.payload as IMonthlyStats[];
            return data.slice(-6);
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:sales=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['salesbymonth'],
        queryFn: fetchSales,
        enabled: !!user
    })
    return {sales, isPending, refetch, isSuccess}
}


export const useFetchSalesQuantityByMonth = () => {
    const {user} = useAuth();
    const fetchSales = async ():Promise<IMonthlyStats[]> => {
        try {
            if(!user) return [];
            const res = await getSalesQuantityGroupedByMonthByOrg(user?.org);
            const data = res.payload as IMonthlyStats[];
            return data;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

  const {data:sales=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['salesquantitybymonth'],
    queryFn: fetchSales,
    enabled: !!user
  })
  return {sales, isPending, refetch, isSuccess}
}