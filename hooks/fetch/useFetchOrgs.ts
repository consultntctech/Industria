import { getOrg, getOrgById, getOrgs } from "@/lib/actions/org.action";
import { IOrganization } from "@/lib/models/org.model"
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchOrgs = ()=>{
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchOrgs = async():Promise<IOrganization[]>=>{
        try {
            if(!isAdmin) return [];
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
        enabled: isAdmin
    })

    return {orgs, isPending, refetch, isSuccess}
}


export const useFetchOrgById = ()=>{
    const {user} = useAuth();
    const fetchOrgById = async():Promise<IOrganization | null>=>{
        try {
            if(!user?.org) return null;
            const res = await getOrg(user?.org);
            const org = res.payload as IOrganization;
            return org;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    const {data:org, isPending, refetch, isSuccess} = useQuery({
        queryKey: ['orgById', user?.org],
        queryFn: fetchOrgById,
        enabled: !!user,
    })

    return {org, isPending, refetch, isSuccess}
}


export const useFetchUserOrg = ()=>{
    const {user} = useAuth();
    const fetchUserOrg = async():Promise<IOrganization | null>=>{
        try {
            if(!user) return null;
            const res = await getOrgById(user?.org);
            const org = res.payload as IOrganization;
            return org;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    
    const {data:org, isPending, refetch, isSuccess} = useQuery({
        queryKey: ['userOrg', user?.org],
        queryFn: fetchUserOrg,
        enabled: !!user,
    })
    return {org, isPending, refetch, isSuccess}
}