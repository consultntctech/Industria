'use client'
import { updateUserRoles } from "@/lib/actions/user.action";
import { getSession } from "@/lib/session";
import { ISession } from "@/types/Types"
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

export const useAuth = ()=>{
    const fetchUser = async():Promise<ISession|null>=>{
        try {
            const user = await getSession();
            return user;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    const {data:user, isPending:authLoading, refetch, isSuccess} = useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
    })

    return {user, authLoading, refetch, isSuccess}
}


export const useUpdatedUser = ()=>{
    const {user} = useAuth();
    const fetchPermision = async():Promise<ISession|null>=>{
        try {
            if(!user) return null;
            const res = await updateUserRoles(user?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                return res.payload as ISession;
            }else{
                return null;
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    
    const {data:userData, isPending, refetch, isSuccess} = useQuery({
        queryKey: ['userpermisions', user?._id],
        queryFn: fetchPermision,
        enabled: !!user,
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
    })

    return {user, userData, isPending, refetch, isSuccess}
}