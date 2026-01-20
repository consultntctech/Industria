import { getAvailableProdItems, getAvailableProdItemsByOrg, getProdItems, getProdItemsByOrg } from "@/lib/actions/proditem.action";
import { IProdItem } from "@/lib/models/proditem.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchProditem = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchProditem = async ():Promise<IProdItem[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getProdItems() : await getProdItemsByOrg(user?.org);
            const data = res.payload as IProdItem[];
            return data.sort((a, b) => new Date(b?.createdAt)!.getTime() - new Date(a?.createdAt)!.getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:proditems=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['proditems'],
        queryFn: fetchProditem,
        enabled: !!user
    })
    return {proditems, isPending, refetch, isSuccess}
}


export const useFetchAvailableProditems = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchAvailableProditems = async ():Promise<IProdItem[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getAvailableProdItems() : await getAvailableProdItemsByOrg(user?.org);
            const data = res.payload as IProdItem[];
            return data.sort((a, b) => new Date(b?.createdAt)!.getTime() - new Date(a?.createdAt)!.getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    
    const {data:proditems=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['availableProditems'],
        queryFn: fetchAvailableProditems,
        enabled: !!user
    })
    return {proditems, isPending, refetch, isSuccess}
}