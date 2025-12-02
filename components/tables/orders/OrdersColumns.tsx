import {  formatDate } from "@/functions/dates";
import { isDeadlinePast } from "@/functions/helpers";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { ICustomer } from "@/lib/models/customer.model";
import { IOrder } from "@/lib/models/order.model";
import { IOrganization } from "@/lib/models/org.model";
import { IProduct } from "@/lib/models/product.model";
import { IUser } from "@/lib/models/user.model";
import { Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { GoInfo, GoPencil } from "react-icons/go";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoTrashBinOutline } from "react-icons/io5";

export const OrdersColumns = (
    handleInfo: (item:IOrder)=>void,
    handleEdit: (item:IOrder)=>void,
    handleFulfill: (item:IOrder)=>void,
    handleDelete: (item:IOrder)=>void,
):GridColDef[]=>{
    const {currency} = useCurrencyConfig();

    return [

        
        {
            field: 'customer',
            headerName: 'Customer',
            width:170,
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
            width:170,
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
            field: 'price',
            headerName: `Price ${currency?.symbol || ''}`,
            width:100,
        },
        {
            field: 'quantity',
            headerName: `Quantity`,
            width:100,
        },
        

       
        {
            field: 'deadline',
            headerName: `Deadline`,
            width:100,
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
            width:100,
        },
        {
            field: 'description',
            headerName: `Description`,
            width:150,
        },

        {
            field:'late',
            headerName: 'Response time',
            width:100,
            valueFormatter:(_, row:IOrder)=>{
                const islate = isDeadlinePast(row);
                return islate ? 'Late' : 'On time';
            },
            valueGetter:(_, row:IOrder)=>{
                const islate = isDeadlinePast(row);
                return islate ? 'Late' : 'On time';
            }
        },

        {
            field:'org',
            headerName: 'Organization',
            width:170,
            valueFormatter: (_, row:IOrder)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IOrder)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const org = params?.row?.org as IOrganization;
                return (
                    <Link href={`/dashboard/organizations?Id=${org?._id}`} className="link" >{org?.name}</Link>
                )
            }
        },
                

        {
            field:'createdBy',
            headerName: 'Sales Personnel',
            width:170,
            valueFormatter: (_, row:IOrder)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IOrder)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <Link href={`/dashboard/users?Id=${creator?._id}`} className="link" >{creator?.name}</Link>
                )
            }
        },
        {
            field: 'createdAt',
            headerName: 'Ordered On',
            width:100,
            valueFormatter:(_, row:IOrder)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IOrder)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IOrder)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IOrder)=>{
                return formatDate(row?.updatedAt)
            }
        },

        {
        field:'id',
        headerName:'Actions',
        filterable: false,
        width:150,
        disableExport: true,
        headerAlign:'center',
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Tooltip title="View order">
                     <GoInfo onClick={()=>handleInfo(params?.row)}  className="cursor-pointer text-green-700" />
                    </Tooltip>
                    <Tooltip title="Edit order">
                     <GoPencil onClick={()=>handleEdit(params?.row)}  className="cursor-pointer text-blue-700" />
                    </Tooltip>
                    {
                        params?.row?.status === 'Pending' &&
                        <Tooltip title="Fullfill order">
                            <IoMdCheckmarkCircleOutline onClick={()=>handleFulfill(params?.row)}  className="cursor-pointer text-blue-700" />
                        </Tooltip>
                    }
                    <Tooltip title="Delete order">
                     <IoTrashBinOutline onClick={()=>handleDelete(params?.row)}  className="cursor-pointer text-red-700" />
                    </Tooltip>
                </div>
            )
        },
    }
        
    ]
}