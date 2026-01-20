import { getAvailableGoods, getAvailableGoodsByOrg, getAvailableGoodsByOrgAndProduct, getAvailableGoodsByProduct, getGoods, getGoodsByOrg } from "@/lib/actions/good.action";
import { IGood } from "@/lib/models/good.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchGoods = () => {
    const { user } = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchGoods = async ():Promise<IGood[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getGoods() : await getGoodsByOrg(user?.org);
            const data = res.payload as IGood[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:goods=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['goods'],
        queryFn: fetchGoods,
        enabled: !!user
    })
    return {goods, isPending, refetch, isSuccess}
}


export const useFetchAvailableGoods = () => {
    const { user } = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchAvailableGoods = async ():Promise<IGood[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getAvailableGoods() : await getAvailableGoodsByOrg(user?.org);
            const data = res.payload as IGood[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:goods=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['availableGoods'],
        queryFn: fetchAvailableGoods,
        enabled: !!user
    })
    return {goods, isPending, refetch, isSuccess}
}


export const useFetchAvailableGoodsByProduct = (productId:string) => {
    const { user } = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchAvailableGoods = async ():Promise<IGood[]> => {
        try {
            if(!productId || !user) return [];
            const res = isAdmin ? await getAvailableGoodsByProduct(productId) : await getAvailableGoodsByOrgAndProduct(user?.org, productId);
            const data = res.payload as IGood[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    const {data:goods=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['availableGoodsByProduct', productId],
        queryFn: fetchAvailableGoods,
        enabled: !!productId && !!user,
    })
    return {goods, isPending, refetch, isSuccess}
}