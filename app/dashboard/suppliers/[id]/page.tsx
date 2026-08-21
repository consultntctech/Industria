import SingleSupplier from "@/components/Screens/SingleSupplier";
import { getSupplier } from "@/lib/actions/supplier.action";
import { ISupplier } from "@/lib/models/supplier.model";

type PageProps = {
    params: Promise<{ id: string }>
}

const SupplierPage = async({params}:PageProps) => {
    const {id} = await params;
    const res = await getSupplier(id);
    const supplier = res.payload as ISupplier;
    return (
        <SingleSupplier supplier={supplier} />
    )
}

export default SupplierPage