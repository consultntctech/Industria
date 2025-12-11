import { getRoles } from "@/lib/actions/role.action";
import { IRole } from "@/lib/models/role.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchRoles = () => {
    const fetchRoles = async ():Promise<IRole[]> => {
        try {
            const res = await getRoles();
            const data = res.payload as IRole[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }


    const {data:roles=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['Roles'],
        queryFn: fetchRoles,
    })
  
    return {roles, isPending, refetch, isSuccess}
}