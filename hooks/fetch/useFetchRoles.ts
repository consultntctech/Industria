import {  getRolesByOrg } from "@/lib/actions/role.action";
import { IRole } from "@/lib/models/role.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchRoles = (orgId?:string) => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const id = isAdmin ? orgId : user?.org;
    const fetchRoles = async ():Promise<IRole[]> => {
        try {
            if(!user || !id) return [];
            const res =  await getRolesByOrg(id);
            const data = res.payload as IRole[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }


    const {data:roles=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['Roles', id],
        queryFn: fetchRoles,
        enabled: !!user && !!id
    })
  
    return {roles, isPending, refetch, isSuccess}
}