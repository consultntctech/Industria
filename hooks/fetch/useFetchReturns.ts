import { getReturns, getReturnsByOrg, getReturnsGroupedByMonth, getReturnsGroupedByMonthByOrg, getReturnsQuantityGroupedByMonth, getReturnsQuantityGroupedByMonthByOrg, getTodayReturns, getTodayReturnsByOrg } from "@/lib/actions/returns.action";
import { IReturns } from "@/lib/models/returns.model"
import { IMonthlyStats } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchReturns = (isToday?:boolean) => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchReturns = async ():Promise<IReturns[]> => {
        try {
            if(!user) return [];
            let res;
            if(isAdmin){
                res = isToday ? await getTodayReturns() : await getReturns();
            }else{
                res = isToday ? await getTodayReturnsByOrg(user?.org) : await getReturnsByOrg(user?.org);
            }
            const data = res.payload as IReturns[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    

    const {data:returns=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['Returns', isToday],
        queryFn: fetchReturns,
        enabled: !!user
    })
    return {returns, isPending, refetch, isSuccess}
}


export const useFetchReturnsByMonth = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchReturns = async ():Promise<IMonthlyStats[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getReturnsGroupedByMonth() : await getReturnsGroupedByMonthByOrg(user?.org);
            const data = res.payload as IMonthlyStats[];
            return data.slice(-6);
        } catch (error) {
            console.log(error);
            return [];
        }
    }

  const {data:returns=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['returnsbymonth'],
    queryFn: fetchReturns,
    enabled: !!user
  })
  return {returns, isPending, refetch, isSuccess}

}


export const useFetchReturnsQuantityByMonth = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchReturns = async ():Promise<IMonthlyStats[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getReturnsQuantityGroupedByMonth() : await getReturnsQuantityGroupedByMonthByOrg(user?.org);
            const data = res.payload as IMonthlyStats[];
            return data;
        } catch (error) {
            console.log(error);
            return [];
        }
    }
  
  const {data:returns=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['returnsquantitybymonth'],
    queryFn: fetchReturns,
    enabled: !!user
  })
  return {returns, isPending, refetch, isSuccess}

}