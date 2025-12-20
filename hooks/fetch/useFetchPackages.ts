import { getApprovedPackages, getLastSixMonthsPackages, getPackagedProductStats, getPackages, getPackageStats } from "@/lib/actions/package.action";
import { IPackage } from "@/lib/models/package.model";
import { IMonthlyStats, IPackagedProducts, IPackageStats, QuanityOrPrice } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";

export const useFetchPackages = () => {
    const fetchPackages = async ():Promise<IPackage[]> => {
        try {
            const res = await getPackages();
            const data = res.payload as IPackage[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:packages=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['Packages'],
        queryFn: fetchPackages,
    })
    return {packages, isPending, refetch, isSuccess}
}


export const useFetchApprovedPackages = () => {
    const fetchApprovedPackages = async ():Promise<IPackage[]> => {
        try {
            const res = await getApprovedPackages();
            const data = res.payload as IPackage[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    
    const {data:packages=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['ApprovedPackages'],
        queryFn: fetchApprovedPackages,
    })
    return {packages, isPending, refetch, isSuccess}
}



export const useFetchSixMonthPackages = () => {
    const fetchPackages = async ():Promise<IMonthlyStats[]> => {
        try {
            const res = await getLastSixMonthsPackages();
            const data = res.payload as IMonthlyStats[];
            return data;
        } catch (error) {
            console.log(error);
            return [];
        }
    }
  
  const {data:packages=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['sixmonthspackages'],
    queryFn: fetchPackages,
  })
  return {packages, isPending, refetch, isSuccess}
}


export const useFetchPackageStats = (type: 'quantity' | 'price'='quantity') => {
    const fetchStats = async ():Promise<IPackageStats | null> => {
        try {
            const res = await getPackageStats(type);
            const data = res.payload as IPackageStats;
            return data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    const {data:stats, isPending, refetch, isSuccess} = useQuery({
        queryKey: ['allPackageStats', type],
        queryFn: fetchStats,
    })
    return {stats, isPending, refetch, isSuccess}
}



export const useFetchPackagedProductStats = (type:QuanityOrPrice = "quantity") => {
    const fetchStats = async ():Promise<IPackagedProducts[]> => {
        try {
            const res = await getPackagedProductStats(type);
            const data = res.payload as IPackagedProducts[];
            return data;
        } catch (error) {
            console.log(error);
            return [];
        }
    }
  
  const {data:stats, isPending, refetch, isSuccess} = useQuery({
    queryKey: ['packagedProductStats', type],
    queryFn: fetchStats,
  })
  return {stats, isPending, refetch, isSuccess}
}