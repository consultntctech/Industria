import { Deleter, Editor, Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { IECategory } from "@/lib/models/ecategory.model";
import { IOrganization } from "@/lib/models/org.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";


export const ECategoryColumns = (
    handleEdit: (category:IECategory)=>void,
    handleDelete: (category:IECategory)=>void,
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
            valueFormatter: (_, row:IECategory)=>{
                const orga = row?.org as IOrganization;
                return orga ? orga.name : '';
            },
            valueGetter: (_, row:IECategory)=>{
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
            valueFormatter: (_, row:IECategory)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : row?.creator;
            },
            valueGetter: (_, row:IECategory)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : row?.creator;
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <>
                    {
                        creator ?
                        <Linker tableId="38" link={`/dashboard/users?Id=${creator?._id}`} placeholder={creator?.name} />
                        :
                        <span>{params?.row?.creator}</span>
                    }
                    </>
                )
            }
        },

        {
            field: 'createdAt',
            headerName: 'Created',
            width:100,
            valueFormatter:(_, row:IECategory)=>{
                return formatDate(row?.createdAt)
            },
            valueGetter:(_, row:IECategory)=>{
                return formatDate(row?.createdAt)
            }
        },

        {
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IECategory)=>{
                return formatDate(row?.updatedAt)
            },
            valueGetter:(_, row:IECategory)=>{
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
                    <Editor tableId="93" tip="Edit category" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="93" tip="Delete category" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}