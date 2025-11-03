import { getUsers } from "@/lib/actions/user.action";
import { IUser } from "@/lib/models/user.model";
import { useQuery } from "@tanstack/react-query";

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