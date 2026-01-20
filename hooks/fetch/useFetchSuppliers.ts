import { getProductSuppliers, getProductSuppliersByOrg, getSuppliers, getSuppliersByOrg } from "@/lib/actions/supplier.action";
import { ISupplier } from "@/lib/models/supplier.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchSuppliers = ()=>{
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchSuppliers = async():Promise<ISupplier[]>=>{
        try {
            if(!user) return [];
            const res = isAdmin ? await getSuppliers() : await getSuppliersByOrg(user?.org);
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
    const isAdmin = isSystemAdmin(user);
    const fetchProductSuppliers = async():Promise<ISupplier[]>=>{
        try {
            if(!id || !user) return [];
            const res = isAdmin ? await getProductSuppliers(id) : await getProductSuppliersByOrg(user?.org, id);
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