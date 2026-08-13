import { ILabourer } from "@/lib/models/labourer.model";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";
import { getLabourers, getLabourersByOrg } from "@/lib/actions/labourer.action";
import { useQuery } from "@tanstack/react-query";

export const useFetchLabourers = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchLabourers = async ():Promise<ILabourer[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ?  await getLabourers() : await getLabourersByOrg(user?.org);
            const data = res.payload as ILabourer[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    };

    const {data:labourers=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['labourers'],
        queryFn: fetchLabourers,
        enabled: !!user
    })

    return {labourers, isPending, refetch, isSuccess}
};