import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Image from "next/image";
import Link from "next/link";
import { Linker } from '../../../PermisionHelpers/PermisionHelpers';
import { IUser } from '../../../../lib/models/user.model';

export const ProductionLabourersColumns = ():GridColDef[]=>[
    {
        field: 'photo',
        headerName: 'Photo',
        width:100,
        disableExport:true,
        filterable:false,
        renderCell: (params:GridRenderCellParams)=>(
            <div className="relative flex flex-row items-center h-full pb-2 mt-1">
                <Image alt="member" height={30} width={30}  objectFit="cover"  className="object-cover rounded-full" src={params.row?.photo} />
            </div>
        )
    },
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
            <Linker tableId="38" link={`/dashboard/users?Id=${params.row?._id}`} placeholder={params.row?.name} />
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