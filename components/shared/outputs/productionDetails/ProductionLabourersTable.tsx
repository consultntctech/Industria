import {  IProduction, IProdLabourerAllocation } from "@/lib/models/production.model";
import { Paper, Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { GoPencil } from "react-icons/go";
import { ProductionLabourersColumns } from './ProductionLabourersColumns';
// import { useState } from "react";
// import ProdLabourersSelectModal from "./ProdLabourersSelectModal";
import { ILabourer } from "@/lib/models/labourer.model";
import { useCanUser } from "@/hooks/useAuth";

type ProductionLabourersTableProps = {
  production: IProduction | null;
  openWizard: (screen: number) => void;
}

const ProductionLabourersTable = ({ production, openWizard }: ProductionLabourersTableProps) => {
//   const [openLab, setOpenLab] = useState(false);
  const labourers = (production?.labourerAllocations || []) as unknown as IProdLabourerAllocation[];
  const paginationModel = { page: 0, pageSize: 15 };
  const isEditor = useCanUser('8', 'UPDATE');
//   const handleEdit = ()=>{
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//     setOpenLab(true);
//   }
  return (
    <div className='table-main2' >
        <div className="flex flex-row items-center gap-6">
            <span className='font-bold text-base' >Labourers</span>
            {
                !(production?.status === 'Pending Approval' || production?.status === 'Approved') && isEditor &&
                <Tooltip title="Edit production labourers">
                    <GoPencil onClick={()=>openWizard(3)}  className="cursor-pointer text-blue-700" />
                </Tooltip>
            }
        </div>
        {/* <ProdLabourersSelectModal openLab={openLab} setOpenLab={setOpenLab} production={production} /> */}
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={!production}
                        getRowId={(row:IProdLabourerAllocation)=>{
                            const labourer = row?.labourer as ILabourer
                            return labourer?._id
                        }}
                        rows={labourers}
                        columns={ProductionLabourersColumns()}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                    email:false,
                                    phone:false,
                                    address:false,
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

export default ProductionLabourersTable