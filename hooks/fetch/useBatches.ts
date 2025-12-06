import { getBatches, getBatchesWithGoods, getBatchesWithLineItems } from "@/lib/actions/batch.action";
import { IBatch } from "@/lib/models/batch.model"
import { useQuery } from "@tanstack/react-query";

export const useBatches = (type?:'Raw Material'|'Finished Good' |'Packaging') => {
    const fetchBatches = async ():Promise<IBatch[]> => {
        try {
            const res = await getBatches();
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
    })
    return {batches, isPending, refetch, isSuccess}
}

export const useFetchBatchesWithRMaterials = () => {
    const fetchBatches = async ():Promise<IBatch[]> => {
        try {
            const res = await getBatchesWithGoods();
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
    })
    return {batches, isPending, refetch, isSuccess}
}


export const useFetchBatchesWithLineItems = () => {
    const fetchBatches = async ():Promise<IBatch[]> => {
        try {
            const res = await getBatchesWithLineItems();
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
    })
    return {batches, isPending, refetch, isSuccess}
}