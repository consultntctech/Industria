import { IOrder } from "@/lib/models/order.model";
import { IPackage } from "@/lib/models/package.model";
import { IProdItem } from "@/lib/models/proditem.model";
import { IReturns } from "@/lib/models/returns.model";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { ISales } from "@/lib/models/sales.model";

export interface IStorageStats {
    rawMaterials: IRMaterial[];
    packages: IPackage[];
    packItems: IProdItem[];
}

export interface ICustomerStats {
    orders: IOrder[];
    returns: IReturns[];
    sales: ISales[];
}


export interface ISupplierStats {
    rawMaterials: IRMaterial[];
    packItems: IProdItem[];
}