import { Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { IOrganization } from "@/lib/models/org.model";
// import { ISessionRole } from "@/types/Types";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { IUser } from "@/lib/models/user.model";
import { IDepartment } from "@/lib/models/department.model";
import { IEmployee } from "@/lib/models/employee.model";

export const DepartmentColumns = (
    handleInfo: (type:IDepartment)=>void,
    handleEdit: (type:IDepartment)=>void,
    handleDelete: (type:IDepartment)=>void,
):GridColDef[]=>{

    return [
        
        {
            field: 'name',
            headerName: 'Name',
            width:170,
            valueFormatter: (_, row:IDepartment)=>{
                return row?.name || '';
            },
            valueGetter: (_, row:IDepartment)=>{
                return row?.name || '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const dept = params?.row as IDepartment;
                return (
                    <Linker link={`/dashboard/departments/${dept?._id}`} tableId="95" placeholder={dept?.name} />
                )
            }
        },
        {
            field: 'head',
            headerName: 'Head',
            width:170,
            valueFormatter: (_, row:IDepartment)=>{
                const dept = row?.head as IEmployee;
                return dept ? dept.name : row?.headName;
            },
            valueGetter: (_, row:IDepartment)=>{
                const dept = row?.head as IEmployee;
                return dept ? dept.name : row?.headName;
            },
            renderCell: (params:GridRenderCellParams)=>{
                const dept = params?.row?.head as IEmployee;
                return (
                    <>
                    {
                        dept?
                        <Linker link={`/dashboard/employees?Id=${dept?._id}`} linkStyle="link" tableId="38" placeholder={dept?.name} />
                        :
                        <span className="">{params?.row?.headName}</span>
                    }
                    </>
                )
            }
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
            valueFormatter: (_, row:IDepartment)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IDepartment)=>{
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
            field:'createdBy',
            headerName: 'Created By',
            width:170,
            valueFormatter: (_, row:IDepartment)=>{
                const creator = row?.createdBy as IUser;
                return  creator.name || row?.creator || '';
            },
            valueGetter: (_, row:IDepartment)=>{
                const creator = row?.createdBy as IUser;
                return  creator.name || row?.creator || '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <>
                    {
                        creator?
                        <Linker link={`/dashboard/users?Id=${creator?._id}`} linkStyle="link" tableId="38" placeholder={creator?.name} />
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
            valueFormatter:(_, row:IDepartment)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IDepartment)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IDepartment)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IDepartment)=>{
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
                    <Viewer tableId="95" tip="View department" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="95" tip="Edit department" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="95" tip="Delete department" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}