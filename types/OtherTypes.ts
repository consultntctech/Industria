import { IOrder } from "@/lib/models/order.model";
import { IPackage } from "@/lib/models/package.model";
import { IProdItem } from "@/lib/models/proditem.model";
import { IRMaterial } from "@/lib/models/rmaterial.mode";

export interface IStorageStats {
    rawMaterials: IRMaterial[];
    packages: IPackage[];
    packItems: IProdItem[];
}

export interface ICustomerStats {
    orders: IOrder[];
    returns: IOrder[];
    sales: IOrder[];
}
