import { Deleter, Editor, Linker, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatDate } from "@/functions/dates";
// import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IBatch } from "@/lib/models/batch.model";
import { IGood } from "@/lib/models/good.model";
import { IOrganization } from "@/lib/models/org.model";
import { IProduct } from "@/lib/models/product.model";
import { IProduction } from "@/lib/models/production.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const GoodColumns = (
    handleInfo: (user:IGood)=>void,
    handleEdit: (user:IGood)=>void,
    handleDelete: (user:IGood)=>void,
):GridColDef[]=>{
    // const {currency} = useCurrencyConfig();

    return [
       
        {
            field: 'name',
            headerName: 'Name',
            width:120,
        },

        {
            field: 'serialName',
            headerName: 'Serial Name',
            width:110,
        },
        {
            field:'batch',
            headerName: 'Batch',
            width:170,
            valueFormatter: (_, row:IGood)=>{
                const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
            valueGetter: (_, row:IGood)=>{
                const batch = row?.batch as IBatch;
                return batch ? batch.code : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const batch = params?.row?.batch as IBatch;
                return (
                    <Linker tableId="55" link={`/dashboard/products/batches?Id=${batch?._id}`} placeholder={batch?.code}  />
                )
            }
        },

        {
            field:'product',
            headerName: 'Product',
            width:170,
            valueFormatter: (_, row:IGood)=>{
                const production = row?.production as IProduction;
                const product = production?.productToProduce as IProduct;
                return product ? product.name : '';
            },
            valueGetter: (_, row:IGood)=>{
                const production = row?.production as IProduction;
                const product = production?.productToProduce as IProduct;
                return product ? product.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const production = params?.row?.production as IProduction;
                const product = production?.productToProduce as IProduct;
                return (
                    <Linker tableId="28" link={`/dashboard/products/types?Id=${product?._id}`} placeholder={product?.name}  />
                )
            }
        },
        {
            field:'quantity',
            headerName: 'Quantity',
            width:100,
            headerAlign: 'center',
        },
        // {
        //     field:'unitPrice',
        //     headerName: `Price ${currency ? `(${currency?.symbol})`:'' } `,
        //     width:100,
        // },
        {
            field:'production',
            headerName: 'Production',
            width:170,
            valueFormatter: (_, row:IGood)=>{
                const production = row?.production as IProduction;
                return production ? production.name : '';
            },
            valueGetter: (_, row:IGood)=>{
                const production = row?.production as IProduction;
                return production ? production.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const production = params?.row?.production as IProduction;
                return (
                    <Linker tableId="8" link={`/dashboard/processing/production/${production?._id}`} placeholder={production?.name}  />
                )
            }
        },
    
        // {
        //     field: 'threshold',
        //     headerName: 'Threshold',
        //     width:100,
        //     headerAlign: 'center',
        // },
        {
            field: 'description',
            headerName: 'Description',
            width:150,
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
                    <Linker tableId="100" link={`/dashboard/organizations?Id=${org?._id}`} placeholder={org?.name}  />
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
            field:'createdBy',
            headerName: 'Created By',
            width:170,
            valueFormatter: (_, row:IGood)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IGood)=>{
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
        field:'id',
        headerName:'Actions',
        filterable: false,
        width:120,
        headerAlign: 'center',
        disableExport: true,
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Viewer tableId="88" tip="View Goods" onClick={()=>handleInfo(params?.row)} />
                    <Editor tableId="88" tip="Edit Goods" onClick={()=>handleEdit(params?.row)} />
                    <Deleter tableId="88" tip="Delete Goods" onClick={()=>handleDelete(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}