import { formatDate } from "@/functions/dates";
import { IBatch } from "@/lib/models/batch.model";
import { IOrganization } from "@/lib/models/org.model";
import { IProduct } from "@/lib/models/product.model";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { ISupplier } from "@/lib/models/supplier.model";
import { IUser } from "@/lib/models/user.model";
import { Tooltip } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { GoInfo, GoPencil } from "react-icons/go";
import { IoTrashBinOutline } from "react-icons/io5";

export const RMaterialColumns = (
    handleInfo: (item:IRMaterial)=>void,
    handleEdit: (item:IRMaterial)=>void,
    handleDelete: (item:IRMaterial)=>void,
):GridColDef[]=>{

    return [
       
        {
            field: 'materialName',
            headerName: 'Material Name',
            width:120,
        },

        {
            field:'product',
            headerName: 'Product',
            width:120,
            valueFormatter: (_, row:IRMaterial)=>{
                const product = row?.product as IProduct;
                return product ? product.name : '';
            },
            valueGetter: (_, row:IRMaterial)=>{
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
            field:'supplier',
            headerName: 'Supplier',
            width:120,
            valueFormatter: (_, row:IRMaterial)=>{
                const supplier = row?.supplier as ISupplier;
                return supplier ? supplier.name : '';
            },
            valueGetter: (_, row:IRMaterial)=>{
                const supplier = row?.supplier as ISupplier;
                return supplier ? supplier.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const supplier = params?.row?.supplier as ISupplier;
                return (
                    <Link href={`/dashboard/suppliers?Id=${supplier?._id}`} className="link" >{supplier?.name}</Link>
                )
            }
        },
        {
            field:'batch',
            headerName: 'Batch',
            width:120,
            valueFormatter: (_, row:IRMaterial)=>{
                const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
            valueGetter: (_, row:IRMaterial)=>{
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
            field: 'qStatus',
            headerName: 'Quality Status',
            width:100,
        },
        {
            field: 'qReceived',
            headerName: 'Quantity Received',
            width:110,
        },
        {
            field: 'qAccepted',
            headerName: 'Stock',
            width:110,
        },
        {
            field: 'qRejected',
            headerName: 'Quantity Rejected',
            width:110,
        },
        {
            field: 'unitPrice',
            headerName: 'Unit Price',
            width:110,
        },
        {
            field: 'charges',
            headerName: 'Extra Charges',
            width:110,
        },
        {
            field: 'discount',
            headerName: 'Discount',
            width:110,
        },
        {
            field: 'price',
            headerName: 'Price Paid',
            width:110,
        },
        {
            field: 'yield',
            headerName: 'Expected Yield',
            width:110,
        },
        {
            field: 'dateReceived',
            headerName: 'Date Received',
            width:110,
            valueFormatter:(_, row:IRMaterial)=>{
                return formatDate(row?.dateReceived)
            },
            valueGetter:(_, row:IRMaterial)=>{
                return formatDate(row?.dateReceived)
            }
        },
        {
            field: 'reason',
            headerName: 'Reason for Rejection',
            width:150,
        },
        {
            field: 'note',
            headerName: 'Note',
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
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Tooltip title="View raw material">
                        <GoInfo onClick={()=>handleInfo(params?.row)}  className="cursor-pointer text-green-700" />
                    </Tooltip>
                    <Tooltip title="Edit raw material">
                        <GoPencil onClick={()=>handleEdit(params?.row)}  className="cursor-pointer text-blue-700" />
                    </Tooltip>
                    <Tooltip title="Delete raw material">
                        <IoTrashBinOutline onClick={()=>handleDelete(params?.row)}  className="cursor-pointer text-red-700" />
                    </Tooltip>
                </div>
            )
        },
    }
        
    ]
}