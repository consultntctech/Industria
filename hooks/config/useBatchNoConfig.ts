import { IBatchConfig } from "@/lib/models/batchconfig.model";
import { useAuth } from "../useAuth";
import { getBatchConfForOrg, getBatchConfigsByOrg } from "@/lib/actions/batchconfig.action";
import { useQuery } from "@tanstack/react-query";

export const useBatchNoConfig = () => {
    const {user} = useAuth();
    const fetchBatchConfig = async():Promise<IBatchConfig|null>=>{
        try {
            if(!user) return null;
            const result = await getBatchConfForOrg(user?.org);
            const conf = result.payload as IBatchConfig;
            return conf;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    const {data:batchConfig, refetch, isPending:batchConfigLoading} = useQuery({
        queryKey:['batchconf'],
        queryFn:fetchBatchConfig,
        enabled:!!user?.org
    })

    return {batchConfig, refetch, batchConfigLoading}
}


export const useAllBatchNoConfig = () => {
    const {user} = useAuth();
    const fetchBatchConfig = async():Promise<IBatchConfig[]>=>{
        try {
            if(!user) return [];
            const result = await getBatchConfigsByOrg(user?.org);
            const confs = result.payload as IBatchConfig[];
            return confs;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const {data:batchConfigs=[], refetch, isPending} = useQuery({
        queryKey:['allbatchconfs'],
        queryFn:fetchBatchConfig,
        enabled:!!user?.org
    })
    

    return {batchConfigs, refetch, isPending}
}