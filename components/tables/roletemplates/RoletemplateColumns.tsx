import { formatDate } from "@/functions/dates";
import { IOrganization } from "@/lib/models/org.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IRoleTemplate } from "@/lib/models/roletemplate.model";
import { IRole } from "@/lib/models/role.model";
import { Assigner, Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";

export const RoletemplateColumns = (
    handleInfo: (role:IRoleTemplate)=>void,
    handleEdit: (role:IRoleTemplate)=>void,
    handleAssign: (role:IRoleTemplate)=>void,
    handleDelete: (role:IRoleTemplate)=>void,
):GridColDef[]=>{

    return [

        {
            field: 'name',
            headerName: 'Name',
            width:170,
        },

        
        {
            field: 'roles',
            headerName: 'Roles',
            width:300,
            valueFormatter: (_, row:IRoleTemplate)=>{
                const roles = row?.roles as IRole[];
                return roles ? roles.map(op=>op.name).join(', ') : '';
            },
            valueGetter: (_, row:IRoleTemplate)=>{
                const roles = row?.roles as IRole[];
                return roles ? roles.map(op=>op.name).join(', ') : '';
            },
            renderCell:(params:GridRenderCellParams)=>{
                const roles = params?.row?.roles as IRole[];
                return (
                    <div className="flex flex-wrap gap-2 flex-row">
                        {roles?.map((op, index)=>(
                            <span key={index} >
                                <Linker tableId="27" link={`/dashboard/roles?Id=${op._id}`} placeholder={op?.name} />
                                {index < roles.length - 1 && ', '}
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
            valueFormatter: (_, row:IRoleTemplate)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IRoleTemplate)=>{
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
            valueFormatter: (_, row:IRoleTemplate)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IRoleTemplate)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <Linker link={`/dashboard/users?Id=${creator?._id}`} placeholder={creator?.name} tableId="38" />
                )
            }
        },

        {
            field: 'createdAt',
            headerName: 'Created',
            width:100,
            valueFormatter:(_, row:IRoleTemplate)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IRoleTemplate)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IRoleTemplate)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IRoleTemplate)=>{
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
                    <Viewer tableId="23" tip="View template" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="23" tip="Edit template" onClick={()=>handleEdit(params?.row)} />
                    <Assigner tableId="38" tip="Assign template" onClick={()=>handleAssign(params?.row)} />
                    <Deleter tableId="23" tip="Delete template" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}