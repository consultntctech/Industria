import { getProductSuppliers, getSuppliers } from "@/lib/actions/supplier.action";
import { ISupplier } from "@/lib/models/supplier.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchSuppliers = ()=>{
    const fetchSuppliers = async():Promise<ISupplier[]>=>{
        try {
            const res = await getSuppliers();
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
    })

    return {suppliers, isPending, refetch, isSuccess}
}


export const useFetchProductSuppliers = (id:string)=>{
    const fetchProductSuppliers = async():Promise<ISupplier[]>=>{
        try {
            if(!id) return [];
            const res = await getProductSuppliers(id);
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
        enabled:!!id
    })

    return {suppliers, isPending, refetch, isSuccess}
}