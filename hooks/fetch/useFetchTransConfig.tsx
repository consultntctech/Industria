import { enqueueSnackbar } from "notistack";
import { useAuth } from "../useAuth";
import { ITransConfig } from "@/lib/models/transconfig.model";
import { getTransConfig } from "@/lib/actions/transconfig.action";
import { useQuery } from "@tanstack/react-query";

export const useFetchTransConfig = ()=>{
    const {user} = useAuth();

    const fetchConfig = async():Promise<ITransConfig | null>=>{
        try {
            if(!user) return null;
            const res = await getTransConfig(user?.org);
            const payload = res.payload as ITransConfig
            return payload
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occurred fetching transaction configuration', {variant:'error'});
            return null;
        }
    }

    const {data:config={} as ITransConfig, isLoading, isSuccess, refetch} = useQuery({
        queryKey: ['transaction-config'],
        queryFn: fetchConfig,
        enabled: !!user
    })

    return {config, isLoading, isSuccess, refetch}
}