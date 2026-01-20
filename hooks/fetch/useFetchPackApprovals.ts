import { isSystemAdmin } from "@/Data/roles/permissions";
import { getPackApprovals, getPackApprovalsByOrg } from "@/lib/actions/packapproval.action";
import { IPackApproval } from "@/lib/models/packapproval.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";

export const useFetchPackApprovals = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchPackApprovals = async ():Promise<IPackApproval[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getPackApprovals() : await getPackApprovalsByOrg(user?.org);
            const data = res.payload as IPackApproval[];
            return data
            .sort((a, b) => a.status === 'Pending' ? 1 : b.status === 'Pending' ? -1 : 0)
            .sort((a, b) => new Date(b?.createdAt)!.getTime() - new Date(a?.createdAt)!.getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:packApprovals=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['packApprovals'],
        queryFn: fetchPackApprovals,
        enabled: !!user
    })
    return {packApprovals, isPending, refetch, isSuccess}
}