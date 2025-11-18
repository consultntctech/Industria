import { getApprovedPackages, getPackages } from "@/lib/actions/package.action";
import { IPackage } from "@/lib/models/package.model";
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