import { getCustomers } from "@/lib/actions/customer.action";
import { ICustomer } from "@/lib/models/customer.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchCustomers = () => {
    const fetchCustomers = async ():Promise<ICustomer[]> => {
        try {
            const res = await getCustomers();
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
    })
    return {customers, isPending, refetch, isSuccess}
}