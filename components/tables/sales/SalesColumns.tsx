import {  formatTimestamp } from "@/functions/dates";
import { getProductCounts } from "@/functions/helpers";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { ICustomer } from "@/lib/models/customer.model";
import { ILineItem } from "@/lib/models/lineitem.model";
import { IOrganization } from "@/lib/models/org.model";
import { ISales } from "@/lib/models/sales.model";
import { IUser } from "@/lib/models/user.model";
import { Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { GoInfo, GoPencil } from "react-icons/go";
import { LiaUndoAltSolid } from "react-icons/lia";

export const SalesColoumns = (
    handleInfo: (sale:ISales)=>void,
    handleEdit: (sale:ISales)=>void,
    handleRefund: (sale:ISales)=>void,
):GridColDef[]=>{
    const {currency} = useCurrencyConfig();

    return [

        {
            field: 'createdAt',
            headerName: 'Sold On',
            width:100,
            valueFormatter:(_, row:ISales)=>{
                return formatTimestamp(row?.createdAt)
            },
            valueGetter:(_, row:ISales)=>{
                return formatTimestamp(row?.createdAt)
            }
        },
        {
            field: 'customer',
            headerName: 'Customer',
            width:170,
            valueFormatter: (_, row:ISales)=>{
                const customer = row?.customer as ICustomer;
                return customer ? customer.name : '';
            },
            valueGetter: (_, row:ISales)=>{
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
            field:'products',
            headerName: 'Products',
            width:200,
            valueFormatter: (_, row:ISales)=>{
                const products = row?.products as ILineItem[];
                const items = getProductCounts(products);
                const itemNames = items.map(item=>item.name)?.join(', ');
                return itemNames ? itemNames : '';
            },
            valueGetter: (_, row:ISales)=>{
                const products = row?.products as ILineItem[];
                const items = getProductCounts(products);
                const itemNames = items.map(item=>item.name)?.join(', ');
                return itemNames ? itemNames : '';
            },
            renderCell: (params: GridRenderCellParams) => {
                const products = params.row?.products as ILineItem[];
                const items = getProductCounts(products);
                return (
                    <div className="flex flex-row items-center gap-1 flex-wrap">
                    {items?.map((item, index) => (
                        <span key={item?.id}>
                        <Link href={`/dashboard/products/types?Id=${item?.id}`} className="link">
                          {item?.quantity} x {item?.name}
                        </Link>
                        {index < items.length - 1 && ', '}
                        </span>
                    ))}
                    </div>
                );
            }

        },

        {
            field: 'price',
            headerName: `Price ${currency?.symbol || ''}`,
            width:100,
        },
        {
            field: 'discount',
            headerName: `Discount ${currency?.symbol || ''}`,
            width:100,
        },
        

        {
            field: 'charges',
            headerName: `Charges ${currency?.symbol || ''}`,
            width:100,
        },

        

        {
            field:'org',
            headerName: 'Organization',
            width:170,
            valueFormatter: (_, row:ISales)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:ISales)=>{
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
            valueFormatter: (_, row:ISales)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:ISales)=>{
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
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:ISales)=>{
                return formatTimestamp(row?.updatedAt)
            },
            valueGetter:(_, row:ISales)=>{
                return formatTimestamp(row?.updatedAt)
            }
        },

        {
        field:'id',
        headerName:'Actions',
        filterable: false,
        width:120,
        disableExport: true,
        headerAlign:'center',
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Tooltip title="View sale">
                        <GoInfo onClick={()=>handleInfo(params?.row)}  className="cursor-pointer text-green-700" />
                    </Tooltip>
                    <Tooltip title="Edit sale">
                        <GoPencil onClick={()=>handleEdit(params?.row)}  className="cursor-pointer text-blue-700" />
                    </Tooltip>
                    <Tooltip title="Refund sale">
                        <LiaUndoAltSolid  onClick={()=>handleRefund(params?.row)}  className="cursor-pointer text-blue-700" />
                    </Tooltip>
                </div>
            )
        },
    }
        
    ]
}