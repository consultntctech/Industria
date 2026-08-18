import SingleStorage from "@/components/Screens/SingleStorage";
import { getStorage } from "@/lib/actions/storage.action";
import { IStorage } from "@/lib/models/storage.model";

type PageProps={
    params: Promise<{id:string}>
}

const page = async({params}:PageProps) => {
    const {id} = await params;
    const res = await getStorage(id);
    const storage = res?.payload as IStorage;
    return (
        <SingleStorage storage={storage} />
    )
}

export default page