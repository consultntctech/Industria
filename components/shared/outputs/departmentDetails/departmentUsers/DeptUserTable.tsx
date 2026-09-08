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

type DeptUserTableProps = {
    isHod: boolean;
    currentDepartment: IDepartment | null;
    users: IUser[];
    isPending: boolean;
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<IUser[], Error>>
}

const DeptUserTable = ({isHod, currentDepartment, users, isPending, refetch}:DeptUserTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);

  



    const paginationModel = { page: 0, pageSize: 15 };



    const handleInfo = (user:IUser)=>{
        setShowInfo(true);
        setCurrentUser(user);
    }

    const handleDelete = (user:IUser)=>{
        setShowDelete(true);
        setCurrentUser(user);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentUser(null);
    }

    const handleDeleteUser = async()=>{
        try {
            if(!currentUser || !currentDepartment) return;
            const res = await removeUserFromDepartment(currentDepartment._id, currentUser._id);
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


    const content = currentUser ? `Are you sure you want to remove employee ${currentUser.name} from this department? This will also remove the permissions they inherited from the department.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Employees</span>
        <DeptUserInfoModal isHod={isHod} refetch={refetch} infoMode={showInfo} setInfoMode={setShowInfo} currentUser={currentUser} setCurrentUser={setCurrentUser} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteUser} title="Remove Employee" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IUser)=>row._id}
                        rows={users}
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