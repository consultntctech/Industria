import { getAvailableProdItems, getProdItems } from "@/lib/actions/proditem.action";
import { IProdItem } from "@/lib/models/proditem.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchProditem = () => {
    const fetchProditem = async ():Promise<IProdItem[]> => {
        try {
            const res = await getProdItems();
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
    })
    return {proditems, isPending, refetch, isSuccess}
}


export const useFetchAvailableProditems = () => {
    const fetchAvailableProditems = async ():Promise<IProdItem[]> => {
        try {
            const res = await getAvailableProdItems();
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
    })
    return {proditems, isPending, refetch, isSuccess}
}