import { formatDate } from "@/functions/dates";
import { IBatch } from "@/lib/models/batch.model";
import { ILineItem } from "@/lib/models/lineitem.model";
import { IProduct } from "@/lib/models/product.model";
import { GridColDef } from "@mui/x-data-grid";

export const OrderLineItemsColumns = (

):GridColDef[]=>{
    return [

        {
            field: 'product',
            headerName:'Product',
            width:200,
            valueFormatter: (_, row:ILineItem)=>{
                const product = row?.product as IProduct;
                return product?.name;
            },
            valueGetter: (_, row:ILineItem)=>{
                const product = row?.product as IProduct;
                return product?.name;
            },
        },

        {
            field:'serialNumber',
            headerName:'Serial Number',
            width:100,
        },
        {
            field: 'name',
            headerName:'Name',
            width:120,
        },

        
        {
            field:'batch',
            headerName:'Batch',
            width:120,
            valueFormatter: (_, row:ILineItem)=>{
                const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
            valueGetter: (_, row:ILineItem)=>{
                const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
        },
        
        {
            field:'price',
            headerName:'Price',
            width:100,
        },
        
        {
            field:'createdAt',
            headerName:'Created At',
            width:100,
            valueFormatter:(_, row:ILineItem)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:ILineItem)=>{
                return formatDate(row?.createdAt)
            }
        }
    ]
}