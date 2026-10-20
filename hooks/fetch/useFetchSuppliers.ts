import { getProductSuppliersByOrg, getSupplierItems, getSuppliersByOrg } from "@/lib/actions/supplier.action";
import { ISupplier } from "@/lib/models/supplier.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { ISupplierStats } from "@/types/OtherTypes";

export const useFetchSuppliers = ()=>{
    const {user} = useAuth();
    const fetchSuppliers = async():Promise<ISupplier[]>=>{
        try {
            if(!user) return [];
            const res = await getSuppliersByOrg(user?.org);
            const suppliers = res.payload as ISupplier[];
            return suppliers;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:suppliers=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['suppliers'],
        queryFn: fetchSuppliers,
        enabled: !!user
    })

    return {suppliers, isPending, refetch, isSuccess}
}


export const useFetchProductSuppliers = (id:string)=>{
    const {user} = useAuth();
    const fetchProductSuppliers = async():Promise<ISupplier[]>=>{
        try {
            if(!id || !user) return [];
            const res = await getProductSuppliersByOrg(user?.org, id);
            const suppliers = res.payload as ISupplier[];
            return suppliers;
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    const {data:suppliers=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['productSuppliers', id],
        queryFn: fetchProductSuppliers,
        enabled:!!id && !!user
    })

    return {suppliers, isPending, refetch, isSuccess}
}


export const useFetchSupplierItems = (id:string)=>{
    const fetchSupplierItems = async ():Promise<ISupplierStats> => {
        try {
            if(!id) return {rawMaterials:[], packItems:[]};
            const res = await getSupplierItems(id);
            const data = res.payload as ISupplierStats;
            return data;
        } catch (error) {
            console.log(error);
            return {rawMaterials:[], packItems:[]};
        }
    }
  
  const {data:supplierItems={rawMaterials:[], packItems:[]}, isPending, refetch, isSuccess} = useQuery({
    queryKey: ['supplierItems', id],
    queryFn: fetchSupplierItems,
    enabled: !!id
  })
  const {rawMaterials, packItems} = supplierItems;
  return {rawMaterials, packItems, isPending, refetch, isSuccess}
}