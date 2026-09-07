import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { Dispatch, SetStateAction, useEffect, useState } from 'react'
import ETypeInfoModal from './DepartmentInfoModal'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { isSystemAdmin } from '@/Data/roles/permissions'
import { DepartmentColumns } from './DepartmentColumns';
import { IDepartment } from '@/lib/models/department.model';
import { deleteDepartment, getDepartment } from '@/lib/actions/department.action';
import { useFetchDepartments } from '@/hooks/fetch/useFetchDepartments';

type DepartmentTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentDepartment:IDepartment | null;
    setCurrentDepartment:Dispatch<SetStateAction<IDepartment | null>>;
}

const DepartmentTable = ({setOpenNew, currentDepartment, setCurrentDepartment}:DepartmentTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const {departments, isPending, refetch} = useFetchDepartments();
    const searchParams = useSearchParams();
    const depId = searchParams.get("Id");

    useEffect(() => {
        if (!depId) return;

        let isMounted = true;

        const fetchEType = async () => {
            try {
            const res = await getDepartment(depId);
            if (!isMounted) return;

            const depData = res.payload as IDepartment;
            if (!res.error) {
                setCurrentDepartment(depData);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching department", { variant: "error" });
            }
            }
        };

        fetchEType();

        return () => {
            isMounted = false;
        };
    }, [depId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (type:IDepartment)=>{
        setCurrentDepartment(type);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (type:IDepartment)=>{
        setShowInfo(true);
        setCurrentDepartment(type);
    }

    const handleDelete = (type:IDepartment)=>{
        setShowDelete(true);
        setCurrentDepartment(type);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentDepartment(null);
    }

    const handleDeleteEType = async()=>{
        try {
            if(!currentDepartment) return;
            const res = await deleteDepartment(currentDepartment?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting department', {variant:'error'});
        }
    }


    const content =  `Are you sure you want to delete department ${currentDepartment?.name}? This will also remove all the permissions on the department from its users`;

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Departments</span>
        <ETypeInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentDepartment={currentDepartment} setCurrentDepartment={setCurrentDepartment} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteEType} title="Delete department" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IDepartment)=>row._id}
                        rows={departments}
                        columns={DepartmentColumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:isAdmin,
                                  createdAt:false,
                                  updatedAt:false,
                                  description:false,
                                  createdBy:false,
                                }
                              }
                         }}
                        pageSizeOptions={[5, 10, 15, 20, 30, 50, 100]}
                        // checkboxSelection
                        className='dark:bg-[#0F1214] dark:border dark:text-blue-800'
                        sx={{ border: 0 }}
                        // slots={{toolbar:GridToolbar}}
                        showToolbar
                        slotProps={{
                            toolbar:{
                                showQuickFilter:true,
                                printOptions:{
                                    hideFooter:true, hideToolbar:true
                                }
                            }
                        }}
                    />
                </Paper>
            }
        </div>
    </div>
  )
}

export default DepartmentTable