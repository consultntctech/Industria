import { Deleter, Editor, Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { ICategory } from "@/lib/models/category.model";
import { IOrganization } from "@/lib/models/org.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";


export const CategoryColumns = (
    handleEdit: (category:ICategory)=>void,
    handleDelete: (category:ICategory)=>void,
):GridColDef[]=>{

    return [

        {
            field: 'name',
            headerName: 'Name',
            width:170,
        },
      

        {
            field: 'description',
            headerName: 'Description',
            width:250,
        },

        

        {
            field:'org',
            headerName: 'Organization',
            width:170,
            valueFormatter: (_, row:ICategory)=>{
                const orga = row?.org as IOrganization;
                return orga ? orga.name : '';
            },
            valueGetter: (_, row:ICategory)=>{
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
            valueFormatter: (_, row:ICategory)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:ICategory)=>{
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
            valueFormatter:(_, row:ICategory)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:ICategory)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:ICategory)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:ICategory)=>{
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
                    <Editor tableId="32" tip="Edit category" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="32" tip="Delete category" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}