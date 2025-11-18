import { getPackApprovals } from "@/lib/actions/packapproval.action";
import { IPackApproval } from "@/lib/models/packapproval.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchPackApprovals = () => {
    const fetchPackApprovals = async ():Promise<IPackApproval[]> => {
        try {
            const res = await getPackApprovals();
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
    })
    return {packApprovals, isPending, refetch, isSuccess}
}