import { IDashboardStats, IDashStats, IGlobalFinance, IOrderAndSalesStats, IStats, ITransactCount, ITransactMontly } from "@/types/Types"
import { getCostStatsByOrg, getDashboardStatsByOrg, getGlobalFinanceStatsByOrg, getMonthlyTransactionCountsByOrg, getMonthlyTransactionSummaryByOrg,  getOrderAndSalesStatsByOrg, getStatsByOrg, getUserDashStats } from "@/lib/actions/stats.action";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { ICostStats } from "@/types/FinanceTypes";

export const useFetchStats = () => {
  const {user} = useAuth();
  const fetchStats = async ():Promise<IStats | null> => {
      try {
          if(!user) return null;
          const res = await getStatsByOrg(user?.org);
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
      enabled: !!user
  })
  return {stats, isPending, refetch, isSuccess}
}
    



export const useFetchTransactMonthly = (month?:number, year?:number, type?:"quantity" | "price") => {
  const {user} = useAuth();
  const fetchStats = async():Promise<ITransactMontly | null> => {
      try {
          if(!user) return null;
          const res = await getMonthlyTransactionSummaryByOrg(user?.org, month, year, type);  
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
      enabled: !!user
  })
  return {transactMontly, isPending, refetch, isSuccess}
}



export const useFetchMonthlyTransactionCounts = () => {
    const {user} = useAuth();
    const fetchMonthlyTransactionCounts = async ():Promise<ITransactCount | null> => {
        try {
            if(!user) return null;
            const res = await getMonthlyTransactionCountsByOrg(user?.org);
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
    enabled: !!user
  })
  return {transactCount, isPending, refetch, isSuccess}
}



export const useFetchOrderAndSalesStats = () => {
  const {user} = useAuth();
  const fetchOrderAndSalesStats = async ():Promise<IOrderAndSalesStats[] | null> => {
      try {
          if(!user) return null;
          const res = await getOrderAndSalesStatsByOrg(user?.org);
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
    enabled: !!user
  })
  return {orderAndSalesStats, isPending, refetch, isSuccess}
}


export const useFetchGlobalFinanceStats = () => {
  const {user} = useAuth();
  const fetchGlobalFinanceStats = async ():Promise<IGlobalFinance | null> => {
      try {
          if(!user) return null;
          const res = await getGlobalFinanceStatsByOrg(user?.org);
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
    enabled: !!user
  })
  return {globalFinanceStats, isPending, refetch, isSuccess}
}



export const useFetchDashboardStats = () => {
  const {user} = useAuth();
  const fetchDashboardStats = async ():Promise<IDashboardStats | null> => {
      try {
          if(!user) return null;
          const res = await getDashboardStatsByOrg(user?.org);
          const data = res.payload as IDashboardStats;
          return data;
      } catch (error) {
          console.log(error);
          return null;
      }
  }
  
  
  
  const {data:dashboardStats, isPending, refetch, isSuccess} = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    enabled: !!user
  })
  return {dashboardStats, isPending, refetch, isSuccess}
}


export const useFetchUserDashboardStats = () => {
  const {user} = useAuth();
  const fetchUserDashboardStats = async ():Promise<IDashStats | null> => {
    try {
      if(!user?.org) return null;
      const res = await getUserDashStats(user?.org);
      const data = res.payload as IDashStats;
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  const {data:dashboardStats, isPending, refetch, isSuccess} = useQuery({
    queryKey: ['dashboardStats', user?.org],
    queryFn: fetchUserDashboardStats,
    enabled: !!user?.org,
  })
  return {dashboardStats, isPending, refetch, isSuccess}
}




export const useFetchCostStats = () => {
  const {user} = useAuth();
  const fetchCostStats = async ():Promise<ICostStats | null> => {
      try {
          if(!user) return null;
          const res = await getCostStatsByOrg(user?.org);
          const data = res.payload as ICostStats;
          return data;
      } catch (error) {
          console.log(error);
          return null;
      }
  }

  const {data:costStats, isPending, refetch, isSuccess} = useQuery({
    queryKey: ['costStats'],
    queryFn: fetchCostStats,
    enabled: !!user
  })
  return {costStats, isPending, refetch, isSuccess}
}