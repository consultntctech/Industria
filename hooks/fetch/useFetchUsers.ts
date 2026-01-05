import { getForgotByToken } from "@/lib/actions/forgot.action";
import { getUsers } from "@/lib/actions/user.action";
import { IForgot } from "@/lib/models/forgot.model";
import { IUser } from "@/lib/models/user.model";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { enqueueSnackbar } from "notistack";

export const useFetchUsers = () => {
    const fetchUsers = async():Promise<IUser[]>=>{
        try {
            const res = await getUsers();
            const users = res.payload as IUser[];
            return users;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:users=[], isPending, refetch} = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    })

    return {users, isPending, refetch}
}


export const useFetchUserReset = () =>{
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const fetchUserReset = async():Promise<IForgot|null>=>{
        try {
            if(!token) {
                enqueueSnackbar('No request received for this operation', {variant:'error'});
                return null;
            };
            const getUserReset = await getForgotByToken(token?.toString());
            if(getUserReset.error){
                enqueueSnackbar(getUserReset.message, {variant:'error'});
                return null;
            }
            return getUserReset.payload as IForgot;
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while fetching user reset', {variant:'error'});
            return null;
        }
    }

    const {data:forgot, isPending, refetch} = useQuery({
        queryKey: ['userReset'],
        queryFn: fetchUserReset,
    })
    return {forgot, isPending, refetch}
}