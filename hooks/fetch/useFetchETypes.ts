import { isSystemAdmin } from "@/Data/roles/permissions";
import { useAuth } from "../useAuth";
import { IEType } from "@/lib/models/etype.model";
import { useQuery } from "@tanstack/react-query";
import { getETypes, getETypesByCategory, getETypesByOrg } from "@/lib/actions/etype.action";

export const useFetchETypes = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);

    const fetchETypes = async ():Promise<IEType[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getETypes() : await getETypesByOrg(user?.org);
            const data = res.payload as IEType[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:types=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['etypes'],
        queryFn: fetchETypes,
        enabled: !!user
    })
    return {types, isPending, refetch, isSuccess}
}


export const useFetchETypesByCategory = (categoryId:string) => {
    const fetchETypes = async ():Promise<IEType[]> => {
        try {
            if(!categoryId) return [];
            const res = await getETypesByCategory(categoryId);
            const data = res.payload as IEType[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    
  const {data:types=[], isPending, refetch, isSuccess} = useQuery({
    queryKey: ['etypes-by-category', categoryId],
    queryFn: fetchETypes,
    enabled: !!categoryId
  })
  return {types, isPending, refetch, isSuccess}
}