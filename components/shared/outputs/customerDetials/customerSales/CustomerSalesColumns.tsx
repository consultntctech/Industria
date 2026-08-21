import { Linker } from "@/components/PermisionHelpers/PermisionHelpers";
import { formatTimestamp } from "@/functions/dates";
import { getProductCounts } from "@/functions/helpers";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { ILineItem } from "@/lib/models/lineitem.model";
import { ISales } from "@/lib/models/sales.model";
import { IUser } from "@/lib/models/user.model";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export const CustomerSalesColumns = ():GridColDef[]=>{
    const {currency} = useCurrencyConfig();
    return [
         {
            field: 'createdAt',
            headerName: 'Sold On',
            width:100,
            valueFormatter:(_, row:ISales)=>{
                return formatTimestamp(row?.createdAt)
            },
            valueGetter:(_, row:ISales)=>{
                return formatTimestamp(row?.createdAt)
            },
            renderCell: (params:GridRenderCellParams)=>{
                const sales = params?.row as ISales;
                const date = formatTimestamp(sales?.createdAt);
                return (
                    <Linker tableId="82" link={`/dashboard/transactions/sales?Id=${sales?._id}`} placeholder={ date || sales?.createdAt} />
                )
            }
        },
       

        {
            field:'products',
            headerName: 'Products',
            width:200,
            valueFormatter: (_, row:ISales)=>{
                const products = row?.products as ILineItem[];
                const items = getProductCounts(products);
                const itemNames = items.map(item=>item.name)?.join(', ');
                return itemNames ? itemNames : '';
            },
            valueGetter: (_, row:ISales)=>{
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
                        {index < items.length - 1 ? ', ':''}
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
            valueFormatter:(_, row:ISales)=>{
                return row?.discount ? row?.discount : 0;
            },
            valueGetter:(_, row:ISales)=>{
                return row?.discount ? row?.discount : 0;
            }
        },
        

        {
            field: 'charges',
            headerName: `Charges ${currency?.symbol || ''}`,
            width:100,
            valueFormatter:(_, row:ISales)=>{
                return row?.charges ? row?.charges : 0;
            },
            valueGetter:(_, row:ISales)=>{
                return row?.charges ? row?.charges : 0;
            }
        },

                

        {
            field:'createdBy',
            headerName: 'Sales Personnel',
            width:170,
            valueFormatter: (_, row:ISales)=>{
                const creator = row?.createdBy as IUser;
                return creator ? creator.name : '';
            },
            valueGetter: (_, row:ISales)=>{
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

    ]
}