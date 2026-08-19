import { getItemsInStorage, getStorages, getStoragesByOrg } from "@/lib/actions/storage.action";
import { IStorage } from "@/lib/models/storage.model";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";
import { IStorageStats } from "@/types/OtherTypes";

export const useFetchStorages = () => {
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const fetchStorages = async ():Promise<IStorage[]> => {
        try {
            if(!user) return [];
            const res = isAdmin ? await getStorages() : await getStoragesByOrg(user?.org);
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
        enabled: !!user
    })
    return {storages, isPending, refetch, isSuccess}
}


export const useFetchStorageItems = (id:string) => {
    const fetchStorageItems = async ():Promise<IStorageStats> => {
        try {
            if(!id) return {rawMaterials:[], packages:[], packItems:[]};
            const res = await getItemsInStorage(id);
            const data = res.payload as IStorageStats;
            return data;
        } catch (error) {
            console.log(error);
            return {rawMaterials:[], packages:[], packItems:[]};
        }
    }
    const {data:storageItems={} as IStorageStats, isPending, refetch, isSuccess} = useQuery({
        queryKey: ['StorageItems', id],
        queryFn: fetchStorageItems,
        enabled: !!id
    })
    // const {rawMaterials, packages, packItems} = storageItems as IStorageStats;
    return {storageItems, isPending, refetch, isSuccess}
}