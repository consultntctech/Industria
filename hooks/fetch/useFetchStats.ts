import { IGlobalFinance, IOrderAndSalesStats, IStats, ITransactCount, ITransactMontly } from "@/types/Types"
import { getGlobalFinanceStats, getMonthlyTransactionCounts, getMonthlyTransactionSummary, getOrderAndSalesStats, getStats } from "@/lib/actions/stats.action";
import { useQuery } from "@tanstack/react-query";

export const useFetchStats = () => {
    const fetchStats = async ():Promise<IStats | null> => {
        try {
            const res = await getStats();
            const data = res.payload as IStats;
            return data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    const {data:stats, isPending, refetch, isSuccess} = useQuery({
        queryKey: ['allStats'],
        queryFn: fetchStats,
    })
    return {stats, isPending, refetch, isSuccess}
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



export const useFetchOrderAndSalesStats = () => {
    const fetchOrderAndSalesStats = async ():Promise<IOrderAndSalesStats[] | null> => {
        try {
            const res = await getOrderAndSalesStats();
            const data = res.payload as IOrderAndSalesStats[];
            return data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
  
  
  const {data:orderAndSalesStats, isPending, refetch, isSuccess} = useQuery({
    queryKey: ['orderAndSalesStats'],
    queryFn: fetchOrderAndSalesStats,
  })
  return {orderAndSalesStats, isPending, refetch, isSuccess}
}


export const useFetchGlobalFinanceStats = () => {
    const fetchGlobalFinanceStats = async ():Promise<IGlobalFinance | null> => {
        try {
            const res = await getGlobalFinanceStats();
            const data = res.payload as IGlobalFinance;
            return data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
  
  
  
  const {data:globalFinanceStats, isPending, refetch, isSuccess} = useQuery({
    queryKey: ['globalFinanceStats'],
    queryFn: fetchGlobalFinanceStats,
  })
  return {globalFinanceStats, isPending, refetch, isSuccess}
}