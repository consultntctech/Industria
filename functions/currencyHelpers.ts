
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { IOriginalPrice } from "@/types/Types";

export const currencyRate = (original:IOriginalPrice | null, otherCurrency:IOtherCurrency | null, showRate:boolean, useRate:boolean):number => {
    if(!original) return otherCurrency?.rate || 1;
     if(showRate && !useRate) return original?.rate || 1;
     if(original && !otherCurrency) return original?.rate || 1;
     return otherCurrency?.rate || 1;
}


export const exposeRate = (currentCurrency:IOtherCurrency | null, otherCurrency:IOtherCurrency | null):boolean => {
    return (!!currentCurrency && !!otherCurrency) && (currentCurrency._id === otherCurrency._id) && (currentCurrency.rate !== otherCurrency.rate);
}