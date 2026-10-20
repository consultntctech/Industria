import {  getRoleTemplatesByOrg } from "@/lib/actions/roletemplate.action";
import { IRoleTemplate } from "@/lib/models/roletemplate.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";

export const useFetchRoleTemplates = () => {
    const {user} = useAuth();
    const fetchRoleTemplates = async ():Promise<IRoleTemplate[]> => {
        try {
            if(!user) return [];
            const res = await getRoleTemplatesByOrg(user?.org);
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
        enabled: !!user
    })
  
    return {roleTemplates, isPending, refetch, isSuccess}
}