import { Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { IOrganization } from "@/lib/models/org.model";
// import { ISessionRole } from "@/types/Types";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { IUser } from "@/lib/models/user.model";
import { IEquipment } from "@/lib/models/equipment.model";
import { IEType } from "@/lib/models/etype.model";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IStorage } from "@/lib/models/storage.model";

export const EquipmentColumns = (
    handleInfo: (type:IEquipment)=>void,
    handleEdit: (type:IEquipment)=>void,
    handleDelete: (type:IEquipment)=>void,
):GridColDef[]=>{
    const {currency} = useCurrencyConfig();

    return [
        
        {
            field: 'name',
            headerName: 'Name',
            width:170,
        },
        {
            field: 'type',
            headerName: 'Type',
            width:170,
            valueFormatter: (_, row:IEquipment)=>{
                const type = row?.type as IEType;
                return type ? type.name : '';
            },
            valueGetter: (_, row:IEquipment)=>{
                const type = row?.type as IEType;
                return type ? type.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const type = params?.row?.type as IEType;
                return (
                    <Linker link={`/dashboard/equipment/types?Id=${type?._id}`} tableId="92" placeholder={type?.name} />
                )
            }
        },

        {
            field: 'brand',
            headerName: 'Brand',
            width:100,
        },
        {
            field: 'model',
            headerName: 'Model',
            width:100,
        },
        {
            field: 'serialNumber',
            headerName: 'Serial Number',
            width:100,
        },
        {
            field: 'tag',
            headerName: 'Asset Tag',
            width:100,
        },
        {
            field: 'price',
            headerName: `Price (${currency?.symbol || 'Primmary Currency'})`,
            width:100,
        },

        {
            field:'location',
            headerName: 'Storage',
            width:140,
            valueFormatter: (_, row:IEquipment)=>{
                const location = row?.location as IStorage;
                return location ? location.name : '';
            },
            valueGetter: (_, row:IEquipment)=>{
                const location = row?.location as IStorage;
                return location ? location.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const location = params?.row?.location as IStorage;
                return (
                    <Linker link={`/dashboard/storage?Id=${location?._id}`} tableId="77" placeholder={location?.name} />
                )
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            width:100,
        },
        {
            field: 'description',
            headerName: 'Note',
            width:250,
        },
        {
            field:'org',
            headerName: 'Organization',
            width:140,
            valueFormatter: (_, row:IEquipment)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IEquipment)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const org = params?.row?.org as IOrganization;
                return (
                    <Linker link={`/dashboard/organizations?Id=${org?._id}`} tableId="100" placeholder={org?.name} />
                )
            }
        },

        {
            field: 'purchaseDate',
            headerName: 'Purchase Date',
            width:100,
            valueFormatter:(_, row:IEquipment)=>{
                return formatDate(row?.purchaseDate)
            },
            valueGetter:(_, row:IEquipment)=>{
                return formatDate(row?.purchaseDate)
            }
        },

         {
            field:'createdBy',
            headerName: 'Created By',
            width:170,
            valueFormatter: (_, row:IEquipment)=>{
                const creator = row?.createdBy as IUser;
                return  creator.name || row?.creator || '';
            },
            valueGetter: (_, row:IEquipment)=>{
                const creator = row?.createdBy as IUser;
                return  creator.name || row?.creator || '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <>
                    {
                        creator?
                        <Link href={`/dashboard/users?Id=${creator?._id}`} className="link" >{creator?.name}</Link>
                        :
                        <span className="">{params?.row?.creator}</span>
                    }
                    </>
                )
            }
        },

        {
            field: 'createdAt',
            headerName: 'Created',
            width:100,
            valueFormatter:(_, row:IEquipment)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IEquipment)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IEquipment)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IEquipment)=>{
                return formatDate(row?.updatedAt)
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
                    <Viewer tableId="94" tip="View equipment" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="94" tip="Edit equipment" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="94" tip="Delete equipment" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}