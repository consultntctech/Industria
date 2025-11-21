import SinglePackage from "@/components/Screens/SinglePackage";
import { getPackage } from "@/lib/actions/package.action";
import { IPackage } from "@/lib/models/package.model";

const page = async({params}:{params:Promise<{id:string}>}) => {
    const {id} = await params;
    const res = await getPackage(id);
    const currentPackage = res.payload as IPackage;
  return (
    <SinglePackage currentPackage={currentPackage} />
  )
}

export default page