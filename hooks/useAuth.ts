'use client'
import { getSession } from "@/lib/session";
import { ISession } from "@/types/Types"
import { useQuery } from "@tanstack/react-query";

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