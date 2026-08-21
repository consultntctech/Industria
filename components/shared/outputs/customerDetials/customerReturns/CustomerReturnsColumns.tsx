import { Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatTimestamp } from "@/functions/dates";
import { getProductCounts } from "@/functions/helpers";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { ILineItem } from "@/lib/models/lineitem.model";
import { IReturns } from "@/lib/models/returns.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const CustomerReturnsColumns = ():GridColDef[]=>{
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
            valueFormatter:(_, row:IReturns)=>{
                return row?.discount ? row?.discount : 0;
            },
            valueGetter:(_, row:IReturns)=>{
                return row?.discount ? row?.discount : 0;
            }
        },
        

        {
            field: 'charges',
            headerName: `Charges ${currency?.symbol || ''}`,
            width:100,
            valueFormatter:(_, row:IReturns)=>{
                return row?.charges ? row?.charges : 0;
            },
            valueGetter:(_, row:IReturns)=>{
                return row?.charges ? row?.charges : 0;
            }
        },
        {
            field: 'reason',
            headerName: `Reason`,
            width:200,
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
    ]
}