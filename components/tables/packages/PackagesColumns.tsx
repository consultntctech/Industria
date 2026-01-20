
import { Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IBatch } from "@/lib/models/batch.model";
import { IOrganization } from "@/lib/models/org.model";
import { IPackage } from "@/lib/models/package.model";
// import { IProdItem } from "@/lib/models/proditem.model";
import { IStorage } from "@/lib/models/storage.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";


export const PackagesColumns = (
    handleInfo: (item:IPackage)=>void,
    handleEdit: (item:IPackage)=>void,
    handleDelete: (item:IPackage)=>void,
):GridColDef[]=>{
    const {currency} = useCurrencyConfig();
    return [
       
        {
            field: 'name',
            headerName: 'Name',
            width:160,
            valueFormatter: (_, item:IPackage)=> item.name || '',
            valueGetter: (_, item:IPackage)=> item.name || '',
            renderCell: (param:GridRenderCellParams)=>{
                const pack = param.row;
                return(
                    <Linker link={`/dashboard/distribution/packaging/${pack?._id}`} placeholder={pack?.name} tableId="99" />
                )
            }
        },
        
        {
            field:'packagingType',
            headerName: 'Type',
            width:100
        },
        
      
       
        {
            field: 'quantity',
            headerName: 'Quantity',
            width:100,
        },
        {
            field: 'accepted',
            headerName: 'Quantity Used',
            width:100,
        },
        {
            field: 'rejected',
            headerName: 'Quantity Rejected',
            width:100,
        },
        {
            field: 'weight',
            headerName: 'Weight',
            width:100,
        },
        
        {
            field:'batch',
            headerName: 'Batch',
            width:100,
            valueFormatter: (_, row:IPackage)=>{
                const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
            valueGetter: (_, row:IPackage)=>{
                const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
            
            renderCell: (params:GridRenderCellParams)=>{
                const batch = params?.row?.batch as IBatch;
                return (
                    <Linker link={`/dashboard/products/batches?Id=${batch?._id}`} placeholder={batch?.code} tableId="55" />
                )
            }
        },
        {
            field: 'qStatus',
            headerName: 'Quality Status',
            width:100,
        },
        {
            field: 'cost',
            headerName: currency ? `Cost (${currency.symbol})` : 'Cost',
            width:100,
        },
        
        {
            field:'storage',
            headerName: 'Storage',
            width:100,
            valueFormatter: (_, row:IPackage)=>{
                const storage = row?.storage as IStorage;
                return storage ? storage.name : '';
            },
            valueGetter: (_, row:IPackage)=>{
                const storage = row?.storage as IStorage;
                return storage ? storage.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const storage = params?.row?.storage as IStorage;
                return (
                    <Linker link={`/dashboard/storage?Id=${storage?._id}`} placeholder={storage?.name} tableId="77" />
                )
            }
        },
        {
            field: 'description',
            headerName: 'Description',
            width:150,
        },
       

        {
            field:'approvedBy',
            headerName: 'Approver',
            width:170,
            valueFormatter: (_, row:IPackage)=>{
                const approver = row?.approvedBy as IUser;
                return approver ? approver.name : '';
            },
            valueGetter: (_, row:IPackage)=>{
                const approver = row?.approvedBy as IUser;
                return approver ? approver.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const creator = params?.row?.approver as IUser;
                return (
                    <Linker link={`/dashboard/users?Id=${creator?._id}`} placeholder={creator?.name} tableId="38" />
                )
            }
        },
        
        {
            field: 'approvalStatus',
            headerName: 'Approval Status',
            width:110,
            headerAlign: 'center',
            valueFormatter: (_, row:IPackage)=>{
                const status = row?.approvalStatus as string;
                return status ? status : '';
            },
            valueGetter: (_, row:IPackage)=>{
                const status = row?.approvalStatus as string;
                return status ? status : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const status = params?.row?.approvalStatus as string;
                return (
                    <div className="h-full flex-center gap-3">
                      <span className={`${status === 'Pending' ? 'text-yellow-700' : status === 'Approved' ? 'text-green-700' : 'text-red-700'}`}>{status}</span>
                    </div>
                )
            }
        },
        
        
        {
            field: 'comment',
            headerName: `Approver's Comment`,
            width:150,
        },
        {
            field:'createdBy',
            headerName: 'Started By',
            width:170,
            valueFormatter: (_, row:IPackage)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IPackage)=>{
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
            field:'supervisor',
            headerName: 'Supervised By',
            width:170,
            valueFormatter: (_, row:IPackage)=>{
                const supervisor = row?.supervisor as IUser;
                return supervisor ? supervisor.name : '';
            },
            valueGetter: (_, row:IPackage)=>{
                const supervisor = row?.supervisor as IUser;
                return supervisor ? supervisor.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const supervisor = params?.row?.supervisor as IUser;
                return (
                    <Linker link={`/dashboard/users?Id=${supervisor?._id}`} placeholder={supervisor?.name} tableId="38" />
                )
            }
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
                    <Linker link={`/dashboard/organizations?Id=${org?._id}`} placeholder={org?.name} tableId="100" />
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
        field:'id',
        headerName:'Actions',
        filterable: false,
        width:120,
        disableExport: true,
        headerAlign: 'center',
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Viewer tableId="99" tip="View package" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="99" tip="Edit package" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="99" tip="Delete package" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}