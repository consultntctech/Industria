import { getSales, getTodaySales } from "@/lib/actions/sales.action";
import { ISales } from "@/lib/models/sales.model"
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
        queryKey: ['sales', isToday],
        queryFn: fetchSales,
    })
    return {sales, isPending, refetch, isSuccess}
}