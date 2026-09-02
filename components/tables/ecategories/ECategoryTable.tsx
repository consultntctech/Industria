import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import DialogueAlet from "@/components/misc/DialogueAlet";
import { useSearchParams } from "next/navigation";
import { IECategory } from "@/lib/models/ecategory.model";
import { ECategoryColumns } from "./ECategoryColumns";
import { deleteECategory,  getECategoryById } from "@/lib/actions/ecategory.action";
import { useFetchECategories } from "@/hooks/fetch/useFetchECategories";

type ECategoryTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentCategory:IECategory | null;
    setCurrentCategory:Dispatch<SetStateAction<IECategory | null>>;
}

const ECategoryTable = ({setOpenNew, currentCategory, setCurrentCategory}:ECategoryTableProps) => {
    const [showDelete, setShowDelete] = useState(false);
    

    const {categories, isPending, refetch} = useFetchECategories();

    // console.log('Creator: ', categories[0]?.createdBy)
    const searchParams = useSearchParams();
        const categoryId = searchParams.get("Id");
    
        useEffect(() => {
            if (!categoryId) return;
    
            let isMounted = true;
    
            const fetchSupplier = async () => {
                try {
                const res = await getECategoryById(categoryId);
                if (!isMounted) return;
    
                const item = res.payload as IECategory;
                if (!res.error) {
                    setCurrentCategory(item);
                    handleEdit(item)
                }
                } catch (error) {
                if (isMounted) {
                    enqueueSnackbar("Error occurred while fetching category", { variant: "error" });
                }
                }
            };
    
            fetchSupplier();
    
            return () => {
                isMounted = false;
            };
        }, [categoryId]);


    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (cat:IECategory)=>{
        setCurrentCategory(cat);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


    const handleDelete = (cat:IECategory)=>{
        setShowDelete(true);
        setCurrentCategory(cat);
    }

    const handleClose = ()=>{
        setShowDelete(false);
        setCurrentCategory(null);
    }

    const handleDeleteUser = async()=>{
        try {
            if(!currentCategory) return;
            const res = await deleteECategory(currentCategory?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting category', {variant:'error'});
        }
    }


    const content = currentCategory ? `Are you sure you want to delete category ${currentCategory.name}? This will also delete the types and equipments depending on it. This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Equipment Categories</span>
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteUser} title="Delete Category" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IECategory)=>row._id}
                        rows={categories}
                        columns={ECategoryColumns(handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:false,
                                //   description:false,
                                  createdBy:false,
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

export default ECategoryTable