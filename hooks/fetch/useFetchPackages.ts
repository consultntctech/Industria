import { getApprovedPackages, getApprovedPackagesByOrg, getLastSixMonthsPackages, getLastSixMonthsPackagesByOrg, getPackagedProductStats, getPackagedProductStatsByOrg, getPackages, getPackagesByOrg, getPackageStats, getPackageStatsByOrg } from "@/lib/actions/package.action";
import { IPackage } from "@/lib/models/package.model";
import { IMonthlyStats, IPackagedProducts, IPackageStats, QuanityOrPrice } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchPackages = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchPackages = async ():Promise<IPackage[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getPackages() : await getPackagesByOrg(user?.org);
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
        enabled: !!user
    })
    return {packages, isPending, refetch, isSuccess}
}


export const useFetchApprovedPackages = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchApprovedPackages = async ():Promise<IPackage[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getApprovedPackages() : await getApprovedPackagesByOrg(user?.org);
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
        enabled: !!user
    })
    return {packages, isPending, refetch, isSuccess}
}



export const useFetchSixMonthPackages = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchPackages = async ():Promise<IMonthlyStats[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getLastSixMonthsPackages() : await getLastSixMonthsPackagesByOrg(user?.org);
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
    enabled: !!user
  })
  return {packages, isPending, refetch, isSuccess}
}


export const useFetchPackageStats = (type: 'quantity' | 'price'='quantity') => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchStats = async ():Promise<IPackageStats | null> => {
        try {
            if(!user) return null;
            const res = isAdmin ? await getPackageStats(type) : await getPackageStatsByOrg(user?.org, type);
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
        enabled: !!user
    })
    return {stats, isPending, refetch, isSuccess}
}



export const useFetchPackagedProductStats = (type:QuanityOrPrice = "quantity") => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchStats = async ():Promise<IPackagedProducts[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getPackagedProductStats(type) : await getPackagedProductStatsByOrg(user?.org, type);
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
    enabled: !!user
  })
  return {stats, isPending, refetch, isSuccess}
}