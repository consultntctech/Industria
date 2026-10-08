import { Paper, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
// import  { useState } from 'react'
import { useAuth, useCanUser } from '@/hooks/useAuth'
import { isSystemAdmin } from '@/Data/roles/permissions'
import { IEmployee } from '@/lib/models/employee.model';
import { ProdEmployeeColumns } from './ProdEmployeeColumns';
import { IProduction } from '@/lib/models/production.model';
import { GoPencil } from 'react-icons/go';
// import ProdSupervisorsSelectModal from './ProdSupervisorsSelectModal';

type ProdSupervisorsTableProps = {
   production: IProduction | null;
   openWizard: (screen: number) => void;
}

const ProdSupervisorsTable = ({production, openWizard}:ProdSupervisorsTableProps) => {
    // const [openSupervisors, setOpenSupervisors] = useState(false);
    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const supervisors = (production?.supervisors || []) as unknown as IEmployee[];

    const isEditor = useCanUser('8', 'UPDATE');



    const paginationModel = { page: 0, pageSize: 15 };

    // const handleEdit = ()=>{
    //     setOpenSupervisors(true);
    //     window.scrollTo({ top: 0, behavior: 'smooth' });
    // }





    

  return (
    <div className='table-main2' >
       <div className="flex flex-row items-center gap-6">
            <span className='font-bold text-base' >Supervisors</span>
            {
                !(production?.status === 'Pending Approval' || production?.status === 'Approved') && isEditor &&
                <Tooltip title="Edit production supervisors">
                    <GoPencil onClick={()=>openWizard(4)}  className="cursor-pointer text-blue-700" />
                </Tooltip>
            }
        </div>
        {/* <ProdSupervisorsSelectModal openSupervisors={openSupervisors} setOpenSupervisors={setOpenSupervisors} production={production} /> */}
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        // loading={isPending}
                        getRowId={(row:IEmployee)=>row._id}
                        rows={supervisors}
                        columns={ProdEmployeeColumns()}
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

export default ProdSupervisorsTable