import { getAvailableRMaterialsByBatch, getAvailableRMaterialsByBatchByOrg, getRawMaterialsBySupplier, getRawMaterialsBySupplierByOrg, getRMaterials, getRMaterialsByOrg } from "@/lib/actions/rmaterial.action";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchAvailableRMaterialsByBatch = (batchId:string) => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchAvailableRMaterialsByBatch = async ():Promise<IRMaterial[]> => {
        try {
            if (!batchId || !user) return [];
            const res = isAdmin ? await getAvailableRMaterialsByBatch(batchId) : await getAvailableRMaterialsByBatchByOrg(user?.org, batchId);
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
        enabled: !!batchId && !!user,
    })

    return {materials, isPending, refetch, isSuccess}
  
}


export const useFetchRMaterials = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchRMaterials = async ():Promise<IRMaterial[]> => {
        try {
            if (!user) return [];
            const res = isAdmin ? await getRMaterials() : await getRMaterialsByOrg(user?.org);
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
        enabled: !!user,
    })

    return {materials, isPending, refetch, isSuccess}
  
}


export const useFetchRawMaterialsBySupplier = (supplierId:string) => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchRawMaterialsBySupplier = async ():Promise<IRMaterial[]> => {
        try {
            if (!supplierId || !user) return [];
            const res = isAdmin ? await getRawMaterialsBySupplier(supplierId) : await getRawMaterialsBySupplierByOrg(user?.org, supplierId);
            const data = res.payload as IRMaterial[];
            return data;
        
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    const {data:materials=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['rawMaterials', supplierId],
        queryFn: fetchRawMaterialsBySupplier,
        enabled: !!supplierId && !!user,
    })
    return {materials, isPending, refetch, isSuccess}
}