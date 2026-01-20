import { getCustomers, getCustomersByOrg } from "@/lib/actions/customer.action";
import { ICustomer } from "@/lib/models/customer.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

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