import { getBatches, getBatchesByOrg, getBatchesWithGoods, getBatchesWithGoodsByOrg, getBatchesWithLineItems, getBatchesWithLineItemsByOrg } from "@/lib/actions/batch.action";
import { IBatch } from "@/lib/models/batch.model"
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useBatches = (type?:'Raw Material'|'Finished Good' |'Packaging') => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchBatches = async ():Promise<IBatch[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getBatches() : await getBatchesByOrg(user?.org as string);
            const data = res.payload as IBatch[];
            const batches = data.filter(batch=> !type ? true : batch.type === type);
            return batches.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:batches=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['batches', type],
        queryFn: fetchBatches,
        enabled: !!user
    })
    return {batches, isPending, refetch, isSuccess}
}

export const useFetchBatchesWithRMaterials = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchBatches = async ():Promise<IBatch[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getBatchesWithGoods() : await getBatchesWithGoodsByOrg(user?.org);
            const data = res.payload as IBatch[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:batches=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['batches-with-rmaterials'],
        queryFn: fetchBatches,
        enabled: !!user
    })
    return {batches, isPending, refetch, isSuccess}
}


export const useFetchBatchesWithLineItems = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchBatches = async ():Promise<IBatch[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getBatchesWithLineItems() : await getBatchesWithLineItemsByOrg(user?.org);
            const data = res.payload as IBatch[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:batches=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['batches-with-line-items'],
        queryFn: fetchBatches,
        enabled: !!user
    })
    return {batches, isPending, refetch, isSuccess}
}