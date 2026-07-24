import { Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import {  formatDate } from "@/functions/dates";
import { ICustomer } from "@/lib/models/customer.model";
import { IOrder } from "@/lib/models/order.model";
import { OrderSelectType } from "@/types/Types";
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
            field: 'products',
            headerName: 'Products',
            width:170,
            valueFormatter: (_, row:IOrder)=>{
                const products = row?.products as OrderSelectType[];
                return products?.map(item => `${item.quantity} x ${item.product.name}`).join(', ');
            },
            valueGetter: (_, row:IOrder)=>{
                const products = row?.products as OrderSelectType[];
                return products?.map(item => `${item.quantity} x ${item.product.name}`).join(', ');
            },
            renderCell: (params:GridRenderCellParams)=>{
                const products = params?.row?.products as OrderSelectType[];
                return (
                    <>
                    {
                        products?.map((item, index)=>(
                            <Linker link={`/dashboard/products/types?Id=${item?.product?._id}`} tableId="28" placeholder={`${item?.quantity} x ${item?.product?.name}${index < products.length - 1 && ', '}`} key={index} />
                        ))
                    }
                    </>
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