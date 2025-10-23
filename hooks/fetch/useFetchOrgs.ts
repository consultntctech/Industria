import { getOrgs } from "@/lib/actions/org.action";
import { IOrganization } from "@/lib/models/org.model"
import { useQuery } from "@tanstack/react-query";

export const useFetchOrgs = ()=>{
    const fetchOrgs = async():Promise<IOrganization[]>=>{
        try {
            const res = await getOrgs();
            const orgs = res.payload as IOrganization[];
            return orgs;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:orgs=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['orgs'],
        queryFn: fetchOrgs,
    })

    return {orgs, isPending, refetch, isSuccess}
}