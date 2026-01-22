import DialogueAlet from '@/components/misc/DialogueAlet'
import { useFetchUsers } from '@/hooks/fetch/useFetchUsers'
import { deleteUser, getUser } from '@/lib/actions/user.action'
import { IUser } from '@/lib/models/user.model'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import  { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { UserColoumns } from './UserColumns'
import UserInfoModal from './UserInfoModal'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { isSystemAdmin } from '@/Data/roles/permissions'

type UserTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentUser:IUser | null;
    setCurrentUser:Dispatch<SetStateAction<IUser | null>>;
}

const UserTable = ({setOpenNew, currentUser, setCurrentUser}:UserTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const {users, isPending, refetch} = useFetchUsers();
    const searchParams = useSearchParams();
    const userId = searchParams.get("Id");

    useEffect(() => {
        if (!userId) return;

        let isMounted = true;

        const fetchUser = async () => {
            try {
            const res = await getUser(userId);
            if (!isMounted) return;

            const userData = res.payload as IUser;
            if (!res.error) {
                setCurrentUser(userData);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching user", { variant: "error" });
            }
            }
        };

        fetchUser();

        return () => {
            isMounted = false;
        };
    }, [userId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (user:IUser)=>{
        setCurrentUser(user);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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
            if(!currentUser) return;
            const res = await deleteUser(currentUser?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting user', {variant:'error'});
        }
    }


    const content = currentUser ? `Are you sure you want to delete user ${currentUser.name} ? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Users</span>
        <UserInfoModal refetch={refetch} infoMode={showInfo} setInfoMode={setShowInfo} currentUser={currentUser} setCurrentUser={setCurrentUser} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteUser} title="Delete User" content={content} />
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
                        columns={UserColoumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:isAdmin,
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

export default UserTable