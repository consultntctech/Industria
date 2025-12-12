import { getRoleTemplates } from "@/lib/actions/roletemplate.action";
import { IRoleTemplate } from "@/lib/models/roletemplate.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchRoleTemplates = () => {
    const fetchRoleTemplates = async ():Promise<IRoleTemplate[]> => {
        try {
            const res = await getRoleTemplates();
            const data = res.payload as IRoleTemplate[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }


    const {data:roleTemplates=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['RoleTemplates'],
        queryFn: fetchRoleTemplates,
    })
  
    return {roleTemplates, isPending, refetch, isSuccess}
}