import { Deleter, Editor, Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { IBatch } from "@/lib/models/batch.model";
import { IBatchConfig } from "@/lib/models/batchconfig.model";
import { IOrganization } from "@/lib/models/org.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";


export const BatchColumns = (
    handleEdit: (batch:IBatch)=>void,
    handleDelete: (batch:IBatch)=>void,
):GridColDef[]=>{

    return [

        {
            field: 'code',
            headerName: 'Code',
            width:170,
        },
      
        {
            field: 'type',
            headerName: 'Generated For',
            width:150,
        },
        {
            field: 'configType',
            headerName: 'Config Type',
            width:150,
            valueFormatter:(_, row:IBatch)=>{
                return row?.configType || 'Manual';
            },
            valueGetter:(_, row:IBatch)=>{
                return row?.configType || 'Manual';
            }
        },

        {
            field: 'config',
            headerName: 'Configuration',
            width:100,
            valueFormatter:(_, row:IBatch)=>{
                const config = row?.config as IBatchConfig;
                return config ? config.mode : '';
            },
            valueGetter:(_, row:IBatch)=>{
                const config = row?.config as IBatchConfig;
                return config ? config.mode : '';
            }
        },

        {
            field:'org',
            headerName: 'Organization',
            width:170,
            valueFormatter: (_, row:IBatch)=>{
                const orga = row?.org as IOrganization;
                return orga ? orga.name : '';
            },
            valueGetter: (_, row:IBatch)=>{
                const orga = row?.org as IOrganization;
                return orga ? orga.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const orga = params?.row?.org as IOrganization;
                return (
                    <Linker tableId="100" link={`/dashboard/organizations?Id=${orga?._id}`} placeholder={orga?.name} />
                )
            }
        },
        {
            field:'createdBy',
            headerName: 'Created By',
            width:170,
            valueFormatter: (_, row:IBatch)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IBatch)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <Linker tableId="38" link={`/dashboard/users?Id=${creator?._id}`} placeholder={creator?.name} />
                )
            }
        },

        {
            field: 'createdAt',
            headerName: 'Created',
            width:100,
            valueFormatter:(_, row:IBatch)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IBatch)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IBatch)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IBatch)=>{
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
                    <Editor tableId="55" tip="Edit batch" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="55" tip="Delete batch" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}