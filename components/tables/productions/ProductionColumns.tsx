import { formatDate } from "@/functions/dates";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IBatch } from "@/lib/models/batch.model";
import { IOrganization } from "@/lib/models/org.model";
import { IProduct } from "@/lib/models/product.model";
import { IProduction } from "@/lib/models/production.model";
import { IUser } from "@/lib/models/user.model";
import { Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { IoOpenOutline, IoTrashBinOutline } from "react-icons/io5";

export const ProductionColumns = (
    handleDelete: (item:IProduction)=>void,
):GridColDef[]=>{
    const {currency} = useCurrencyConfig();
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
            field:'batch',
            headerName: 'Batch',
            width:120,
            valueFormatter: (_, row:IProduction)=>{
                const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
            valueGetter: (_, row:IProduction)=>{
                const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
            
            renderCell: (params:GridRenderCellParams)=>{
                const batch = params?.row?.batch as IBatch;
                return (
                    <Link href={`/dashboard/products/batches?Id=${batch?._id}`} className="link" >{batch?.code}</Link>
                )
            }
        },
        {
            field:'productToProduce',
            headerName: 'Product',
            width:120,
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
            field: 'productionCost',
            headerName: 'Production Cost',
            width:120,
            valueFormatter:(_, row:IProduction)=>{
                const cost = row?.productionCost as number || 0;
                const extra = row?.extraCost as number || 0;
                return `${currency?.symbol ||''} ${cost + extra}`;
            },
            valueGetter:(_, row:IProduction)=>{
                const cost = row?.productionCost as number || 0;
                const extra = row?.extraCost as number || 0;
                return `${currency?.symbol || ''} ${cost + extra}`;
            }
        },
        {
            field: 'inputQuantity',
            headerName: 'Input Quantity',
            width:100,
        },
        {
            field: 'outputQuantity',
            headerName: 'Output Quantity',
            width:100,
        },
        {
            field: 'status',
            headerName: 'Status',
            width:120,
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
            valueFormatter: (_, row:IProduct)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IProduct)=>{
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
        disableExport: true,
        headerAlign:'center',
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Tooltip title="View production">
                        <Link href={`/dashboard/processing/production/${params.row?._id}`} >
                            <IoOpenOutline className="cursor-pointer text-blue-700" />
                        </Link>
                    </Tooltip>
                    
                    <Tooltip title="Delete production">
                        <IoTrashBinOutline onClick={()=>handleDelete(params?.row)}  className="cursor-pointer text-red-700" />
                    </Tooltip>
                </div>
            )
        },
    }
        
    ]
}