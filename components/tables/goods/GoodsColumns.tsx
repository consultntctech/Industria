import { formatDate } from "@/functions/dates";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IGood } from "@/lib/models/good.model";
import { IOrganization } from "@/lib/models/org.model";
import { IProduct } from "@/lib/models/product.model";
import { IProduction } from "@/lib/models/production.model";
import { IUser } from "@/lib/models/user.model";
import { Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { GoInfo, GoPencil } from "react-icons/go";
import { IoTrashBinOutline } from "react-icons/io5";

export const GoodColumns = (
    handleInfo: (user:IGood)=>void,
    handleEdit: (user:IGood)=>void,
    handleDelete: (user:IGood)=>void,
):GridColDef[]=>{
    const {currency} = useCurrencyConfig();

    return [
       
        {
            field: 'name',
            headerName: 'Name',
            width:120,
        },

        {
            field: 'serialName',
            headerName: 'Serial Name',
            width:110,
        },

        {
            field:'product',
            headerName: 'Product',
            width:170,
            valueFormatter: (_, row:IGood)=>{
                const production = row?.production as IProduction;
                const product = production?.productToProduce as IProduct;
                return product ? product.name : '';
            },
            valueGetter: (_, row:IGood)=>{
                const production = row?.production as IProduction;
                const product = production?.productToProduce as IProduct;
                return product ? product.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const production = params?.row?.production as IProduction;
                const product = production?.productToProduce as IProduct;
                return (
                    <Link href={`/dashboard/products/types?Id=${product?._id}`} className="link" >{product?.name}</Link>
                )
            }
        },
        {
            field:'quantity',
            headerName: 'Quantity',
            width:100,
            headerAlign: 'center',
        },
        {
            field:'unitPrice',
            headerName: `Price ${currency ? `(${currency?.symbol})`:'' } `,
            width:100,
        },
        {
            field:'production',
            headerName: 'Production',
            width:170,
            valueFormatter: (_, row:IGood)=>{
                const production = row?.production as IProduction;
                return production ? production.name : '';
            },
            valueGetter: (_, row:IGood)=>{
                const production = row?.production as IProduction;
                return production ? production.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const production = params?.row?.production as IProduction;
                return (
                    <Link href={`/dashboard/processing/production/${production?._id}`} className="link" >{production?.name}</Link>
                )
            }
        },
    
        {
            field: 'threshold',
            headerName: 'Threshold',
            width:100,
            headerAlign: 'center',
        },
        {
            field: 'description',
            headerName: 'Description',
            width:150,
        },

        {
            field:'org',
            headerName: 'Organization',
            width:170,
            valueFormatter: (_, row:IUser)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IUser)=>{
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

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IUser)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IUser)=>{
                return formatDate(row?.updatedAt)
            }
        },
        {
            field:'createdBy',
            headerName: 'Created By',
            width:170,
            valueFormatter: (_, row:IGood)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IGood)=>{
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
        field:'id',
        headerName:'Actions',
        filterable: false,
        width:120,
        headerAlign: 'center',
        disableExport: true,
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Tooltip title="View Goods">
                        <GoInfo onClick={()=>handleInfo(params?.row)}  className="cursor-pointer text-green-700" />
                    </Tooltip>
                    <Tooltip title="Edit Goods">
                        <GoPencil onClick={()=>handleEdit(params?.row)}  className="cursor-pointer text-blue-700" />
                    </Tooltip>
                    <Tooltip title="Delete Goods">
                        <IoTrashBinOutline onClick={()=>handleDelete(params?.row)}  className="cursor-pointer text-red-700" />
                    </Tooltip>
                </div>
            )
        },
    }
        
    ]
}