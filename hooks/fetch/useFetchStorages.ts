import { getStorages } from "@/lib/actions/storage.action";
import { IStorage } from "@/lib/models/storage.model";
import { useQuery } from "@tanstack/react-query";

export const useFetchStorages = () => {
    const fetchStorages = async ():Promise<IStorage[]> => {
        try {
            const res = await getStorages();
            const data = res.payload as IStorage[];
            return data.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime());
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:storages=[], isPending, refetch, isSuccess} = useQuery({
        queryKey: ['Storages'],
        queryFn: fetchStorages,
    })
    return {storages, isPending, refetch, isSuccess}
}