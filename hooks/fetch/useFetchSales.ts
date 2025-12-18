import { getLastSixMonthsSales, getSales, getSalesGroupedByMonth, getSalesQuantityGroupedByMonth, getTodaySales } from "@/lib/actions/sales.action";
import { ISales } from "@/lib/models/sales.model"
import { IMonthlyStats } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";

export const useFetchSales = (isToday?: boolean) => {
    const fetchSales = async ():Promise<ISales[]> => {
        try {
            const res = isToday ?  await getTodaySales() : await getSales();
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
    })
    return {sales, isPending, refetch, isSuccess}
}


export const useFetchSixMonthsSales = () => {
    const fetchSales = async ():Promise<IMonthlyStats[]> => {
        try {
            const res = await getLastSixMonthsSales();
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
    })
    return {sales, isPending, refetch, isSuccess}
}


export const useFetchSalesByMonth = () => {
    const fetchSales = async ():Promise<IMonthlyStats[]> => {
        try {
            const res = await getSalesGroupedByMonth();
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
    })
    return {sales, isPending, refetch, isSuccess}
}


export const useFetchSalesQuantityByMonth = () => {
    const fetchSales = async ():Promise<IMonthlyStats[]> => {
        try {
            const res = await getSalesQuantityGroupedByMonth();
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
  })
  return {sales, isPending, refetch, isSuccess}
}