import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { Linker } from '../../../PermisionHelpers/PermisionHelpers';
import { IUser } from '../../../../lib/models/user.model';

export const ProductionLabourersColumns = ():GridColDef[]=>[
    
    {
        field: 'name',
        headerName: 'Name',
        width:170,
        valueFormatter: (_, row:IUser)=>{
            const user = row?.name
            return user ? user : '';
        },
        valueGetter: (_, row:IUser)=>{
            const user = row?.name
            return user ? user : '';
        },
        renderCell: (params:GridRenderCellParams)=>(
            <Linker tableId="91" link={`/dashboard/processing/labourers?Id=${params?.row?._id}`} placeholder={params.row?.name} />
        )
    },
    {
        field: 'email',
        headerName: 'Email',
        width:170,
        renderCell: (params:GridRenderCellParams)=>(
            <Link target="_blank" href={`mailto:${params?.row?.email}`}  className="link">{params.row?.email}</Link>
        )
    },

    {
        field: 'phone',
        headerName: 'Phone',
        width:100,
    },
    {
        field: 'address',
        headerName: 'Address',
        width:150,
    },
]