import { getLastSixMonthsSales, getLastSixMonthsSalesByOrg, getSales, getSalesByOrg, getSalesGroupedByMonth, getSalesGroupedByMonthByOrg, getSalesQuantityGroupedByMonth, getSalesQuantityGroupedByMonthByOrg, getTodaySales, getTodaySalesByOrg } from "@/lib/actions/sales.action";
import { ISales } from "@/lib/models/sales.model"
import { IMonthlyStats } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchSales = (isToday?: boolean) => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchSales = async ():Promise<ISales[]> => {
        try {
            if(!user) return [];
            let res;
            if(isAdmin){
                res = isToday ?  await getTodaySales() : await getSales();
            }else{
                res = isToday ?  await getTodaySalesByOrg(user?.org) : await getSalesByOrg(user?.org);
            }
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
    const isAdmin = isSystemAdmin(user);
    const fetchSales = async ():Promise<IMonthlyStats[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getLastSixMonthsSales() : await getLastSixMonthsSalesByOrg(user?.org);
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
    const isAdmin = isSystemAdmin(user);
    const fetchSales = async ():Promise<IMonthlyStats[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getSalesGroupedByMonth() : await getSalesGroupedByMonthByOrg(user?.org);
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
    const isAdmin = isSystemAdmin(user);
    const fetchSales = async ():Promise<IMonthlyStats[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getSalesQuantityGroupedByMonth() : await getSalesQuantityGroupedByMonthByOrg(user?.org);
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