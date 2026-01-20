import { getProdApprovals, getProdApprovalsByOrg } from "@/lib/actions/prodapproval.action";
import { IProdApproval } from "@/lib/models/prodapproval.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";

export const useFetchProdApprovals = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchProdApprovals = async ():Promise<IProdApproval[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getProdApprovals() : await getProdApprovalsByOrg(user?.org);
            const data = res.payload as IProdApproval[];
            return data
            .sort((a, b) => a.status === 'Pending' ? 1 : b.status === 'Pending' ? -1 : 0)
            .sort((a, b) => new Date(b?.createdAt)!.getTime() - new Date(a?.createdAt)!.getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:prodApprovals=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['prodApprovals'],
        queryFn: fetchProdApprovals,
        enabled: !!user
    })
    return {prodApprovals, isPending, refetch, isSuccess}
}