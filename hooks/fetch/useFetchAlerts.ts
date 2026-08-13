import { getAlertsByOrg } from "@/lib/actions/alert.action";
import { useAuth } from "../useAuth";
import { IAlert } from "@/lib/models/alert.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchAlerts = () => {
    const {user} = useAuth();
    // const isAdmin = isSystemAdmin(user);
    const fetchAlerts = async ():Promise<IAlert[]> => {
        try {
            if(!user) return [];
            const res = await getAlertsByOrg(user?.org);
            const data = res.payload as IAlert[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    };
    const {refetch, isPending, isSuccess, data:alerts=[]} = useQuery({
        queryKey: ['alerts'],
        queryFn: fetchAlerts,
        enabled: !!user
    })
    return {alerts, isPending, refetch, isSuccess}
}