import { getAvailableGoodsByOrg, getAvailableGoodsByOrgAndProduct,  getGoodsByOrg, getGoodsWithRawRawMaterialsByOrgAndBatch } from "@/lib/actions/good.action";
import { IGood } from "@/lib/models/good.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";

export const useFetchGoods = () => {
    const { user } = useAuth();
    const fetchGoods = async ():Promise<IGood[]> => {
        try {
            if(!user) return [];
            const res = await getGoodsByOrg(user?.org);
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
    const fetchAvailableGoods = async ():Promise<IGood[]> => {
        try {
            if(!user) return [];
            const res =  await getAvailableGoodsByOrg(user?.org);
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
    const fetchAvailableGoods = async ():Promise<IGood[]> => {
        try {
            if(!productId || !user) return [];
            const res = await getAvailableGoodsByOrgAndProduct(user?.org, productId);
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


export const useFetchGoodsWithRawMaterialsByOrgAndBatch = (batchId:string) => {
    const { user } = useAuth();
    const fetchGoods = async ():Promise<IGood[]> => {
        try {
            if(!user || !batchId) return [];
            const res =  await getGoodsWithRawRawMaterialsByOrgAndBatch(user?.org, batchId);
            const data = res.payload as IGood[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }           

    const {data:goods=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['goodsWithRawRawMaterialsByOrg', user?.org, batchId],
        queryFn: fetchGoods,
        enabled: !!user?.org && !!user && !!batchId,
    })
    return {goods, isPending, refetch, isSuccess}
}