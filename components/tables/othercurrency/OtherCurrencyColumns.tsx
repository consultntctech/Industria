import { Deleter, Editor, Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";


export const OtherCurrencyColumns = (
    handleEdit: (item:IOtherCurrency)=>void,
    handleDelete: (item:IOtherCurrency)=>void,
):GridColDef[]=>{

    return [
       
        {
            field: 'name',
            headerName: 'Name',
            width:130,
        },

        {
            field: 'symbol',
            headerName: 'Symbol',
            width:100,
        },

        {
            field: 'rate',
            headerName: 'Rate',
            width:100,
        },


        {
            field: 'note',
            headerName: 'Notes',
            width:150,
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
            field:'createdBy',
            headerName: 'Created By',
            width:170,
            valueFormatter: (_, row:IOtherCurrency)=>{
                const user = row?.createdBy as IUser;
                return user.name || row?.creator ;
            },
            valueGetter: (_, row:IOtherCurrency)=>{
                const user = row?.createdBy as IUser;
                return user.name || row?.creator ;
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.createdBy as IUser;
                return (
                    <>
                    {
                    creator ?
                    <Linker link={`/dashboard/users?Id=${creator?._id}`} placeholder={creator?.name} tableId="38" />
                    :
                    <div className="flex items-center h-full">
                        <span>{params?.row?.creator}</span>
                    </div>
                    }
                    </>
                )
            }
        },

        {
        field:'id',
        headerName:'Actions',
        filterable: false,
        headerAlign: 'center',
        width:120,
        disableExport: true,
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Editor tableId="48" tip="Edit Currency" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="48" tip="Delete Currency" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}