import { getAvailableLineItemsByProduct, getLineItems, getLineItemsByPackage, getLineItemsByProduct } from "@/lib/actions/lineitem.action";
import { ILineItem } from "@/lib/models/lineitem.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchLineItems = () => {
    const fetchLineItems = async ():Promise<ILineItem[]> => {
        try {
            const res = await getLineItems();
            const data = res.payload as ILineItem[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:lineItems=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['lineItems'],
        queryFn: fetchLineItems,
    })
    return {lineItems, isPending, refetch, isSuccess}
}


export const useFetchLineItemsByPackage = (packageId:string) => {
    const fetchLineItems = async ():Promise<ILineItem[]> => {
        try {
            if (!packageId) return [];
            const res = await getLineItemsByPackage(packageId);
            const data = res.payload as ILineItem[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    
    const {data:lineItems=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['lineItemsByPackage', packageId],
        queryFn: fetchLineItems,
        enabled: !!packageId,
    })
    return {lineItems, isPending, refetch, isSuccess}
}



export const useFetchLineItemsByProduct = (productId:string) => {
    const fetchLineItems = async ():Promise<ILineItem[]> => {
        try {
            if (!productId) return [];
            const res = await getLineItemsByProduct(productId);
            const data = res.payload as ILineItem[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    
    const {data:lineItems=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['lineItemsByProduct', productId],
        queryFn: fetchLineItems,
        enabled: !!productId,
    })
    return {lineItems, isPending, refetch, isSuccess}
}



export const useFetchAvailableLineItemsByProduct = (productId:string, batchId?:string, limit?:number) => {
    const fetchLineItems = async ():Promise<ILineItem[]> => {
        try {
            if (!productId) return [];
            const res = await getAvailableLineItemsByProduct(productId, batchId, limit);
            const data = res.payload as ILineItem[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    
    const {data:lineItems=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['availableLineItemsByProduct', productId, batchId, limit],
        queryFn: fetchLineItems,
        enabled: !!productId,
    })
    return {lineItems, isPending, refetch, isSuccess}
}