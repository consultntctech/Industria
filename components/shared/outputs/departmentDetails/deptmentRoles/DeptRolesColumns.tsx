import { IRole } from "@/lib/models/role.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { TableData } from "@/Data/roles/table";
import { IOperation } from "@/types/Types";
import { Deleter, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";

export const DeptRolesColumns = (
    handleInfo: (role:IRole)=>void,
    handleDelete: (role:IRole)=>void,
):GridColDef[]=>{
    return [

        {
            field: 'name',
            headerName: 'Name',
            width:170,
            valueFormatter: (_, row:IRole)=>{
                return row?.name;
            },
            valueGetter: (_, row:IRole)=>{
                return row?.name;
            },
            renderCell: (params:GridRenderCellParams)=>{
                const row = params?.row as IRole;
                return (
                    <Linker link={`/dashboard/roles?Id=${row?._id}`} tableId="27" placeholder={row?.name} />
                )
            }
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
                    <Viewer tableId="95" tip="View role" onClick={()=>handleInfo(params?.row)} />
                    <Deleter tableId="95" tip="Remove role" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}