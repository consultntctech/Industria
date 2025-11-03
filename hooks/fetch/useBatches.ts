import { getBatches } from "@/lib/actions/batch.action";
import { IBatch } from "@/lib/models/batch.model"
import { useQuery } from "@tanstack/react-query";

export const useBatches = (type?:'Raw Material'|'Finished Good') => {
    const fetchBatches = async ():Promise<IBatch[]> => {
        try {
            const res = await getBatches();
            const data = res.payload as IBatch[];
            const batches = data.filter(batch=> !type ? true : batch.type === type);
            return batches.sort((a,b)=>a.code.localeCompare(b.code));
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