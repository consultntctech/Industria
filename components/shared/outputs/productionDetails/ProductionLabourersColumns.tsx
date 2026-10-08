import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { Linker } from '../../../PermisionHelpers/PermisionHelpers';
import { ILabourer } from "@/lib/models/labourer.model";
import { IProdLabourerAllocation } from "@/lib/models/production.model";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";

export const ProductionLabourersColumns = ():GridColDef[]=>{
    
    const { currency } = useCurrencyConfig();
    return[
    
        {
            field: 'name',
            headerName: 'Name',
            width:170,
            valueFormatter: (_, row:IProdLabourerAllocation)=>{
                const labourer = row?.labourer as ILabourer
                return labourer?.name || ''
            },
                
            valueGetter: (_, row:IProdLabourerAllocation)=>{
                const labourer = row?.labourer as ILabourer
                return labourer?.name || ''
            },
            renderCell: (params:GridRenderCellParams)=>{
                const labourer = params?.row?.labourer as ILabourer
                return(
                    <Linker tableId="91" link={`/dashboard/processing/labourers?Id=${labourer?._id}`} placeholder={labourer?.name} />
                )
            }
        },
        {
            field: 'rate',
            headerName: 'Hourly Rate',
            width:100,
            headerAlign:'center',
            align:'center',
            valueFormatter: (_, row:IProdLabourerAllocation)=>{
                const labourer = row?.labourer as ILabourer
                const rate = labourer?.rate
                return rate ? rate : 0;
            },
            valueGetter: (_, row:IProdLabourerAllocation)=>{
                const labourer = row?.labourer as ILabourer
                const rate = labourer?.rate
                return rate ? rate : 0;
            },
        },
        {
            field:'hoursWorked',
            headerName:'Hours on Prod.',
            width:120,
            headerAlign:'center',
            align:'center',
        },
        {
            field:'cost',
            headerName:`Cost (${currency?.symbol})`,
            width:100,
            headerAlign:'center',
            align:'center',
        },
        {
            field: 'email',
            headerName: 'Email',
            width:170,
            renderCell: (params:GridRenderCellParams)=>{
                const labourer = params?.row?.labourer as ILabourer
                return (
                    <Link target="_blank" href={`mailto:${labourer?.email}`} className="link">
                        {labourer?.email}
                    </Link>
                )
            }
        },

        {
            field: 'phone',
            headerName: 'Phone',
            width:100,
            valueFormatter: (_, row:IProdLabourerAllocation)=>{
                const labourer = row?.labourer as ILabourer
                return labourer?.phone || ''
            },
            valueGetter: (_, row:IProdLabourerAllocation)=>{
                const labourer = row?.labourer as ILabourer
                return labourer?.phone || ''
            }
        },
        {
            field: 'address',
            headerName: 'Address',
            width:150,
            valueFormatter: (_, row:IProdLabourerAllocation)=>{
                const labourer = row?.labourer as ILabourer
                return labourer?.address || ''
            },
            valueGetter: (_, row:IProdLabourerAllocation)=>{
                const labourer = row?.labourer as ILabourer
                return labourer?.address || ''
            }
        },
    ]
}