import { getCustomerItems, getCustomers, getCustomersByOrg } from "@/lib/actions/customer.action";
import { ICustomer } from "@/lib/models/customer.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";
import { ICustomerStats } from "@/types/OtherTypes";

export const useFetchCustomers = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchCustomers = async ():Promise<ICustomer[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getCustomers() : await getCustomersByOrg(user?.org);
            const data = res.payload as ICustomer[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:customers=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['customers'],
        queryFn: fetchCustomers,
        enabled: !!user
    })
    return {customers, isPending, refetch, isSuccess}
}


export const useFetchCustomerItems = (id:string) => {
    const fetchCustomerItems = async ():Promise<ICustomerStats> => {
        try {
            if(!id) return {sales:[], orders:[], returns:[]};
            const res = await getCustomerItems(id);
            const data = res.payload as ICustomerStats;
            return data;
        } catch (error) {
            console.log(error);
            return {sales:[], orders:[], returns:[]};
        }
    }
    
  const {data:customerItems={sales:[], orders:[], returns:[]}, isPending, refetch, isSuccess} = useQuery({
    queryKey: ['customerItems', id],
    queryFn: fetchCustomerItems,
    enabled: !!id
  })
  const {sales, orders, returns} = customerItems;
  return {sales, orders, returns, isPending, refetch, isSuccess}
}