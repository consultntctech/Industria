import SingleCustomer from "@/components/Screens/SingleCustomer";
import { getCustomer } from "@/lib/actions/customer.action";
import { ICustomer } from "@/lib/models/customer.model";

type CustomerPageProps = {
    params:Promise<{id:string}>
}

const CustomerPage = async({params}:CustomerPageProps) => {
    const {id} = await params;
    const res = await getCustomer(id);
    const customer = res?.payload as ICustomer;
    return (
        <SingleCustomer customer ={customer} />
    )
}

export default CustomerPage