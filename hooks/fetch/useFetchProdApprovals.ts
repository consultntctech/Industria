import { getProdApprovals } from "@/lib/actions/prodapproval.action";
import { IProdApproval } from "@/lib/models/prodapproval.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchProdApprovals = () => {
    const fetchProdApprovals = async ():Promise<IProdApproval[]> => {
        try {
            const res = await getProdApprovals();
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
    })
    return {prodApprovals, isPending, refetch, isSuccess}
}