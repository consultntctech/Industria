import { formatDate } from "@/functions/dates";
import { IProduct } from "@/lib/models/product.model";
import { IProduction } from "@/lib/models/production.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";

export const MiniProductionColumns = (
):GridColDef[]=>{
    return [
       
        {
            field: 'name',
            headerName: 'Name',
            width:120,
            valueFormatter: (_, row:IProduction)=>{
                return row ? row.name : '';
            },
            valueGetter: (_, row:IProduction)=>{
                return row ? row.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const production = params?.row as IProduction;
                return (
                    <Link href={`/dashboard/processing/production/${production?._id}`} className="link" >{production?.name}</Link>
                )
            }
        },

        
        {
            field:'productToProduce',
            headerName: 'Product',
            width:150,
            valueFormatter: (_, row:IProduction)=>{
                const product = row?.productToProduce as IProduct;
                return product ? product.name : '';
            },
            valueGetter: (_, row:IProduction)=>{
                const product = row?.productToProduce as IProduct;
                return product ? product.name : '';
            },
            
            renderCell: (params:GridRenderCellParams)=>{
                const product = params?.row?.productToProduce as IProduct;
                return (
                    <Link href={`/dashboard/products/types?Id=${product?._id}`} className="link" >{product?.name}</Link>
                )
            }
        },

        
        {
            field: 'inputQuantity',
            headerName: 'Input Quantity',
            width:120,
        },
        {
            field: 'outputQuantity',
            headerName: 'Output Quantity',
            width:120,
        },
        {
            field: 'status',
            headerName: 'Status',
            width:120,
        },

        
        {
            field: 'createdAt',
            headerName: 'Created',
            width:100,
            valueFormatter:(_, row:IUser)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IUser)=>{
                return formatDate(row?.createdAt)
            }
        },

        
        

        
    
        
    ]
}