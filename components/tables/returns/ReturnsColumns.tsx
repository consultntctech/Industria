import { Linker, Redoer, Viewer } from "@/components/PermisionHelpers/PermisionHelpers";
import {  formatTimestamp } from "@/functions/dates";
import { getProductCounts } from "@/functions/helpers";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { ICustomer } from "@/lib/models/customer.model";
import { ILineItem } from "@/lib/models/lineitem.model";
import { IOrganization } from "@/lib/models/org.model";
import { IReturns } from "@/lib/models/returns.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const ReturnsColumns = (
    handleInfo: (item:IReturns)=>void,
    handleResell: (item:IReturns)=>void,
):GridColDef[]=>{
    const {currency} = useCurrencyConfig();

    return [

        {
            field: 'createdAt',
            headerName: 'Return On',
            width:100,
            valueFormatter:(_, row:IReturns)=>{
                return formatTimestamp(row?.createdAt)
            },
            valueGetter:(_, row:IReturns)=>{
                return formatTimestamp(row?.createdAt)
            }
        },
        {
            field: 'customer',
            headerName: 'Customer',
            width:170,
            valueFormatter: (_, row:IReturns)=>{
                const customer = row?.customer as ICustomer;
                return customer ? customer.name : '';
            },
            valueGetter: (_, row:IReturns)=>{
                const customer = row?.customer as ICustomer;
                return customer ? customer.name : '';
            },
            renderCell: (params:GridRenderCellParams)=>{
                const customer = params?.row?.customer as ICustomer;
                return (
                    <Linker tableId="33" link={`/dashboard/distribution/customers?Id=${customer?._id}`} placeholder={customer?.name} />
                )
            }
        },

        {
            field:'products',
            headerName: 'Products',
            width:200,
            valueFormatter: (_, row:IReturns)=>{
                const products = row?.products as ILineItem[];
                const items = getProductCounts(products);
                const itemNames = items.map(item=>item.name)?.join(', ');
                return itemNames ? itemNames : '';
            },
            valueGetter: (_, row:IReturns)=>{
                const products = row?.products as ILineItem[];
                const items = getProductCounts(products);
                const itemNames = items.map(item=>item.name)?.join(', ');
                return itemNames ? itemNames : '';
            },
            renderCell: (params: GridRenderCellParams) => {
                const products = params.row?.products as ILineItem[];
                const items = getProductCounts(products);
                return (
                    <div className="flex flex-row items-center gap-1 flex-wrap">
                    {items?.map((item, index) => (
                        <span key={item?.id}>
                        <Linker tableId="28" link={`/dashboard/products/types?Id=${item?.id}`} placeholder={`${item?.quantity} x ${item?.name}`} />
                        {index < items.length - 1 && ', '}
                        </span>
                    ))}
                    </div>
                );
            }

        },

        {
            field: 'price',
            headerName: `Price ${currency?.symbol || ''}`,
            width:100,
        },
        {
            field: 'discount',
            headerName: `Discount ${currency?.symbol || ''}`,
            width:100,
        },
        

        {
            field: 'charges',
            headerName: `Charges ${currency?.symbol || ''}`,
            width:100,
        },
        {
            field: 'reason',
            headerName: `Reason`,
            width:200,
        },

        

        {
            field:'org',
            headerName: 'Organization',
            width:170,
            valueFormatter: (_, row:IReturns)=>{
                const org = row?.org as IOrganization;
                return org ? org.name : '';
            },
            valueGetter: (_, row:IReturns)=>{
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
            headerName: 'Sales Personnel',
            width:170,
            valueFormatter: (_, row:IReturns)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:IReturns)=>{
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
            field: 'updatedAt',
            headerName: 'Modified',
            width:100,
            valueFormatter:(_, row:IReturns)=>{
                return formatTimestamp(row?.updatedAt)
            },
            valueGetter:(_, row:IReturns)=>{
                return formatTimestamp(row?.updatedAt)
            }
        },

        {
        field:'id',
        headerName:'Actions',
        filterable: false,
        width:120,
        disableExport: true,
        headerAlign:'center',
        // params:GridRenderCellParams
        renderCell:(params:GridRenderCellParams)=> {
            // console.log(params.row?.id)
            return(
                <div className="h-full flex-center gap-3">
                    <Viewer tableId="86" tip="View return details" onClick={()=>handleInfo(params?.row)} />
                    <Redoer tableId="86" tip="Resale returned items" onClick={()=>handleResell(params?.row)} />
                </div>
            )
        },
    }
        
    ]
}