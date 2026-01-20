import { formatDate } from "@/functions/dates";
import { IRole } from "@/lib/models/role.model";
import { IOrganization } from "@/lib/models/org.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { TableData } from "@/Data/roles/table";
import { IOperation } from "@/types/Types";
import { Assigner, Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";

export const RolesColumns = (
    handleInfo: (role:IRole)=>void,
    handleEdit: (role:IRole)=>void,
    handleAssign: (role:IRole)=>void,
    handleDelete: (role:IRole)=>void,
):GridColDef[]=>{

    return [

        {
            field: 'name',
            headerName: 'Name',
            width:170,
        },

        {
            field: 'table',
            headerName: 'Table',
            width:100,
            valueFormatter: (_, row:IRole)=>{
                const tableId = row?.permissions?.tableid;
                const table = TableData.find(t=>t.id===tableId)?.name;
                return table ? table : '';
            },
            valueGetter: (_, row:IRole)=>{
                const tableId = row?.permissions?.tableid;
                const table = TableData.find(t=>t.id===tableId)?.name;
                return table ? table : '';
            },
        },
        {
            field: 'permissions',
            headerName: 'Permissions',
            width:300,
            valueFormatter: (_, row:IRole)=>{
                const perms = row?.permissions?.operations;
                return perms ? perms.map(op=>op.name).join(', ') : '';
            },
            valueGetter: (_, row:IRole)=>{
                const perms = row?.permissions?.operations;
                return perms ? perms.map(op=>op.name).join(', ') : '';
            },
            renderCell:(params:GridRenderCellParams)=>{
                const perms = params?.row?.permissions?.operations as IOperation[];
                return (
                    <div className="flex flex-wrap gap-2 flex-row">
                        {perms?.map((op, index)=>(
                            <span key={index} >
                                <span  className="text-sm">{op.name}</span>
                                {index < perms.length - 1 && ', '}
                            </span>
                        ))}
                    </div>
                )
            }
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
            valueFormatter: (_, row:IRole)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IRole)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const org = params?.row?.org as IOrganization;
                return (
                    <Linker link={`/dashboard/organizations?Id=${org?._id}`} placeholder={org?.name} tableId="100" />
                )
            }
        },
                

        {
            field:'createdBy',
            headerName: 'Created By',
            width:170,
            valueFormatter: (_, row:IRole)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IRole)=>{
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
            valueFormatter:(_, row:IRole)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IRole)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IRole)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IRole)=>{
                return formatDate(row?.updatedAt)
            }
        },

        {
        field:'id',
        headerName:'Actions',
        filterable: false,
        width:130,
        disableExport: true,
        headerAlign: 'center',
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Viewer tableId="27" tip="View role" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="27" tip="Edit role" onClick={()=>handleEdit(params?.row)} />
                    <Assigner tableId="38" tip="Assign role" onClick={()=>handleAssign(params?.row)} />
                    <Deleter tableId="27" tip="Delete role" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}