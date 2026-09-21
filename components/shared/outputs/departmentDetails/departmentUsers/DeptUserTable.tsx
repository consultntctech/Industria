import DialogueAlet from '@/components/misc/DialogueAlet'
import { IUser } from '@/lib/models/user.model'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { useState } from 'react'
import { DeptUserColumns } from './DeptUserColumns'
import DeptUserInfoModal from './DeptUserInfoModal';
import { IDepartment } from '@/lib/models/department.model';
import { removeUserFromDepartment } from '@/lib/actions/department.action';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { IEmployee } from '@/lib/models/employee.model';

type DeptUserTableProps = {
    isHod: boolean;
    currentDepartment: IDepartment | null;
    employees: IEmployee[];
    isPending: boolean;
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<IEmployee[], Error>>
}

const DeptUserTable = ({isHod, currentDepartment, employees, isPending, refetch}:DeptUserTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<IEmployee | null>(null);

  



    const paginationModel = { page: 0, pageSize: 15 };



    const handleInfo = (emp:IEmployee)=>{
        setShowInfo(true);
        setCurrentEmployee(emp);
    }

    const handleDelete = (emp:IEmployee)=>{
        setShowDelete(true);
        setCurrentEmployee(emp);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentEmployee(null);
    }

    const handleDeleteUser = async()=>{
        try {
            if(!currentEmployee || !currentDepartment) return;
            const account = currentEmployee?.userAccount as IUser;
            const res = await removeUserFromDepartment(currentDepartment._id, account._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while removing employee', {variant:'error'});
        }
    }


    const content = currentEmployee ? `Are you sure you want to remove employee ${currentEmployee.name} from this department? This will also remove the permissions they inherited from the department.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Employees</span>
        <DeptUserInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentEmployee={currentEmployee} setCurrentEmployee={setCurrentEmployee} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteUser} title="Remove Employee" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IEmployee)=>row._id}
                        rows={employees}
                        columns={DeptUserColumns(handleInfo, handleDelete, isHod)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  createdAt:false,
                                  updatedAt:false,
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

export default DeptUserTable