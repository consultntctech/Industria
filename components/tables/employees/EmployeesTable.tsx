import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { isSystemAdmin } from '@/Data/roles/permissions'
import { IEmployee } from '@/lib/models/employee.model';
import { useFetchEmployees } from '@/hooks/fetch/useFetchEmployees';
import { deleteEmployee, getEmployee } from '@/lib/actions/employee.action';
import EmployeeInfoModal from './EmployeeInfoModal';
import { EmployeeColoumns } from './EmployeeColumns';
import { createUserFromEmployee } from '@/lib/actions/user.action';
import { IUser } from '@/lib/models/user.model';

type EmployeesTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentEmployee:IEmployee | null;
    setCurrentEmployee:Dispatch<SetStateAction<IEmployee | null>>;
}

const EmployeesTable = ({setOpenNew, currentEmployee, setCurrentEmployee}:EmployeesTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const {employees, isPending, refetch} = useFetchEmployees();
    const searchParams = useSearchParams();
    const employeeId = searchParams.get("Id");

    useEffect(() => {
        if (!employeeId) return;

        let isMounted = true;

        const fetchUser = async () => {
            try {
            const res = await getEmployee(employeeId);
            if (!isMounted) return;

            const userData = res.payload as IEmployee;
            if (!res.error) {
                setCurrentEmployee(userData);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching employee", { variant: "error" });
            }
            }
        };

        fetchUser();

        return () => {
            isMounted = false;
        };
    }, [employeeId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (emp:IEmployee)=>{
        setCurrentEmployee(emp);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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
        setShowAddUser(false);
        setCurrentEmployee(null);
    }

    const handleShowUser = (emp: IEmployee)=>{
        setCurrentEmployee(emp); 
        setShowAddUser(true);
    }

    const handleDeleteUser = async()=>{
        try {
            if(!currentEmployee) return;
            const res = await deleteEmployee(currentEmployee?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting employee', {variant:'error'});
        }
    }


    const handleAddUser = async()=>{
        try {
            if(!currentEmployee) return;
            const userData:Partial<IUser> = {
                name: currentEmployee.name,
                email: currentEmployee.email?.toLowerCase()?.trim(),
                department: currentEmployee.department,
                address: currentEmployee.address,
                phone: currentEmployee.phone,
                description: currentEmployee.description,
                creator: currentEmployee.creator,
                org: currentEmployee.org,
            }
            setShowAddUser(false);
            const res = await createUserFromEmployee(userData);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while adding user account', {variant:'error'});
        }finally{
            setShowAddUser(false);
        }
    }


    const addContent = currentEmployee ? `You're about to add a user account for employee ${currentEmployee.name}. This will create a new user account with the same details as the employee.` : '';

    const content = currentEmployee ? `Are you sure you want to delete employee ${currentEmployee.name}? This won't affect their user accout, however, cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Employees</span>
        <EmployeeInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentEmployee={currentEmployee} setCurrentEmployee={setCurrentEmployee} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteUser} title="Delete Employee" content={content} />
        <DialogueAlet open={showAddUser} handleClose={handleClose} agreeClick={handleAddUser} title="Add User Account" content={addContent} />
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
                        columns={EmployeeColoumns(handleInfo, handleEdit, handleDelete, handleShowUser)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:isAdmin,
                                  createdAt:false,
                                  updatedAt:false,
                                  department:false,
                                  userAccount:false,
                                  creator: false,
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

export default EmployeesTable