import {  getAvailableLineItemsByOrg, getAvailableLineItemsByProduct, getAvailableLineItemsByProducts,  getLineItemsByOrg,  getLineItemsByPackageAndOrg, getLineItemsByProductAndOrg } from "@/lib/actions/lineitem.action";
import { ILineItem } from "@/lib/models/lineitem.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";

export const useFetchLineItems = () => {
    const {user} = useAuth();
    const fetchLineItems = async ():Promise<ILineItem[]> => {
        try {
            if(!user) return [];
            const res = await getLineItemsByOrg(user?.org);
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
        enabled: !!user
    })
    return {lineItems, isPending, refetch, isSuccess}
}


export const useFetchAvailableLineItems = () => {
    const {user} = useAuth();
    const fetchLineItems = async ():Promise<ILineItem[]> => {
        try {
            if(!user) return [];
            const res = await getAvailableLineItemsByOrg(user?.org);
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
        enabled: !!user
    })
    return {lineItems, isPending, refetch, isSuccess}
}


export const useFetchLineItemsByPackage = (packageId:string) => {
    const {user} = useAuth();
    const fetchLineItems = async ():Promise<ILineItem[]> => {
        try {
            if (!packageId || !user) return [];
            const res = await getLineItemsByPackageAndOrg(packageId, user?.org);
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
        enabled: !!packageId && !!user,
    })
    return {lineItems, isPending, refetch, isSuccess}
}



export const useFetchLineItemsByProduct = (productId:string) => {
    const {user} = useAuth();
    const fetchLineItems = async ():Promise<ILineItem[]> => {
        try {
            if (!productId || !user) return [];
            const res = await getLineItemsByProductAndOrg(productId, user?.org);
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
        enabled: !!productId && !!user,
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


export const useFetchAvailableLineItemsByProducts = (products:string[]) => {
    const fetchLineItems = async ():Promise<ILineItem[]> => {
        try {
            if (!products?.length) return [];
            const res = await getAvailableLineItemsByProducts(products);
            const data = res.payload as ILineItem[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    
    const {data:lineItems=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['availableLineItemsByProducts', products],
        queryFn: fetchLineItems,
        enabled: !!products?.length,
    })
    return {lineItems, isPending, refetch, isSuccess}
}