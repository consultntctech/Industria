import { IProdType } from "@/lib/models/prodtype.model";
import { useAuth } from "../useAuth";
import { getProdTypesByOrg, getProdTyppesSuppliers } from "@/lib/actions/prodtype.action";
import { useQuery } from "@tanstack/react-query";
import { ISupplier } from "@/lib/models/supplier.model";

export const useFetchProdTypes = () => {
    const {user} = useAuth();
    const fetchProdTypes = async ():Promise<IProdType[]> => {
        try {
            if(!user) return [];
            const res = await getProdTypesByOrg(user?.org);
            const data = res.payload as IProdType[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:prodTypes=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['prodTypes'],
        queryFn: fetchProdTypes,
        enabled: !!user
    })
    return {prodTypes, isPending, refetch, isSuccess}
}



export const useFetchProdTypesSuppliers = (id:string) => {
    const {user} = useAuth();
    const fetchProdTypesSuppliers = async ():Promise<ISupplier[]> => {
        try {
            if(!id || !user) return [];
            const res = await getProdTyppesSuppliers(id);
            const data = res.payload as ISupplier[];
            return data;
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    
    const {data:suppliers=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['suppliersforprodtypes', id],
        queryFn: fetchProdTypesSuppliers,
        enabled: !!id && !!user
    })
    return {suppliers, isPending, refetch, isSuccess}
}