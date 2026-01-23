import { getForgotByToken } from "@/lib/actions/forgot.action";
import { getUser, getUsers, getUsersByOrg } from "@/lib/actions/user.action";
import { IForgot } from "@/lib/models/forgot.model";
import { IUser } from "@/lib/models/user.model";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useAuth } from "../useAuth";
import { isDbGlobalAdmin, isSystemAdmin } from "@/Data/roles/permissions";
import { IRole } from "@/lib/models/role.model";

export const useFetchUsers = (showMe:boolean=true, showAdmins:boolean=true) => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchUsers = async():Promise<IUser[]>=>{
        try {
            if(!user) return [];
            const res = isAdmin ? await getUsers() : await getUsersByOrg(user?.org);
            const users = res.payload as IUser[];
            return users
            .filter((u)=>{
                if (showAdmins) return true;
                return !isDbGlobalAdmin(u.roles as IRole[]);
            })
            ?.filter((u) => showMe ? true : u._id !== user?._id)
            ?.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:users=[], isPending, refetch} = useQuery({
        queryKey: ['users', showMe],
        queryFn: fetchUsers,
        enabled: !!user
    })

    return {users, isPending, refetch}
}


export const useFetchUserReset = () =>{
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const fetchUserReset = async():Promise<IForgot|null>=>{
        try {
            if(!token) {
                enqueueSnackbar('No request received for this operation', {variant:'error', autoHideDuration:30_000});
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


export const useFetchUserProfile = () => {
    const {user} = useAuth();
    const fetchUserProfile = async():Promise<IUser|null>=>{
        try {
            if(!user) return null;
            const res = await getUser(user._id);
            return res.payload as IUser;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    const {data:userProfile, isPending, refetch} = useQuery({
        queryKey: ['userProfile'],
        queryFn: fetchUserProfile,
        enabled: !!user,
    })
    return {userProfile, isPending, refetch}
}
