import {  formatDate } from "@/functions/dates";
import { ICustomer } from "@/lib/models/customer.model";
import { IOrder } from "@/lib/models/order.model";
import { IProduct } from "@/lib/models/product.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";


export const OrdersMiniColumns = (
):GridColDef[]=>{

    return [

        
        {
            field: 'customer',
            headerName: 'Customer',
            width:100,
            valueFormatter: (_, row:IOrder)=>{
                const customer = row?.customer as ICustomer;
                return customer ? customer.name : '';
            },
            valueGetter: (_, row:IOrder)=>{
                const customer = row?.customer as ICustomer;
                return customer ? customer.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const customer = params?.row?.customer as ICustomer;
                return (
                    <Link key={customer?._id} href={`/dashboard/distribution/customers?Id=${customer?._id}`} className="link" >{customer?.name}</Link>
                )
            }
        },
        {
            field: 'product',
            headerName: 'Product',
            width:100,
            valueFormatter: (_, row:IOrder)=>{
                const product = row?.product as IProduct;
                return product ? product.name : '';
            },
            valueGetter: (_, row:IOrder)=>{
                const product = row?.product as IProduct;
                return product ? product.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const product = params?.row?.product as IProduct;
                return (
                    <Link href={`/dashboard/products/types?Id=${product?._id}`} className="link" >{product?.name}</Link>
                )
            }
        },


        {
            field: 'quantity',
            headerName: `Quantity`,
            width:70,
        },
        

       
        {
            field: 'deadline',
            headerName: `Deadline`,
            width:90,
            valueFormatter:(_, row:IOrder)=>{
                return formatDate(row?.deadline) || '';
            },
            valueGetter:(_, row:IOrder)=>{
                return formatDate(row?.deadline) || '';
            }
        },
        {
            field: 'status',
            headerName: `Status`,
            width:80,
        },
       

       
                

       

        
    ]
}