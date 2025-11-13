import { getAvailableRMaterialsByBatch, getRMaterials } from "@/lib/actions/rmaterial.action";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { useQuery } from "@tanstack/react-query";

export const useFetchAvailableRMaterialsByBatch = (batchId:string) => {
    const fetchAvailableRMaterialsByBatch = async ():Promise<IRMaterial[]> => {
        try {
            if (!batchId) return [];
            const res = await getAvailableRMaterialsByBatch(batchId);
            const data = res.payload as IRMaterial[];
            return data;
        
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:materials=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['availableMaterials', batchId],
        queryFn: fetchAvailableRMaterialsByBatch,
        enabled: !!batchId,
    })

    return {materials, isPending, refetch, isSuccess}
  
}


export const useFetchRMaterials = () => {
    const fetchRMaterials = async ():Promise<IRMaterial[]> => {
        try {
            const res = await getRMaterials();
            const data = res.payload as IRMaterial[];
            return data.sort((a, b) => new Date(b?.createdAt)!.getTime() - new Date(a?.createdAt)!.getTime());
        
        } catch (error) {
            console.log(error);
            return [];
        }
    }


    const {data:materials=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['materials'],
        queryFn: fetchRMaterials,
        enabled: true,
    })

    return {materials, isPending, refetch, isSuccess}
  
}