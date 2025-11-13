import DialogueAlet from '@/components/misc/DialogueAlet'
import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { enqueueSnackbar } from 'notistack'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import ProductInfoModal from './ProductInfoModal'
import { useSearchParams } from 'next/navigation'
import { ProductColumns } from './ProductColumns'
import { IProduct } from '@/lib/models/product.model'
import { useFetchProducts } from '@/hooks/fetch/useFetchProducts'
import { deleteProduct, getProduct } from '@/lib/actions/product.action'

type ProductTableProps = {
    setOpenNew:Dispatch<SetStateAction<boolean>>;
    currentProduct:IProduct | null;
    setCurrentProduct:Dispatch<SetStateAction<IProduct | null>>;
}

const ProductTable = ({setOpenNew, currentProduct, setCurrentProduct}:ProductTableProps) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const {products, isPending, refetch} = useFetchProducts();
    const searchParams = useSearchParams();
    const productId = searchParams.get("Id");

    useEffect(() => {
        if (!productId) return;

        let isMounted = true;

        const fetchUser = async () => {
            try {
            const res = await getProduct(productId);
            if (!isMounted) return;

            const userData = res.payload as IProduct;
            if (!res.error) {
                setCurrentProduct(userData);
                setShowInfo(true);
            }
            } catch (error) {
            if (isMounted) {
                enqueueSnackbar("Error occurred while fetching product", { variant: "error" });
            }
            }
        };

        fetchUser();

        return () => {
            isMounted = false;
        };
    }, [productId]);



    const paginationModel = { page: 0, pageSize: 15 };

    const handleEdit = (user:IProduct)=>{
        setCurrentProduct(user);
        setOpenNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleInfo = (user:IProduct)=>{
        setShowInfo(true);
        setCurrentProduct(user);
    }

    const handleDelete = (user:IProduct)=>{
        setShowDelete(true);
        setCurrentProduct(user);
    }

    const handleClose = ()=>{
        setShowInfo(false);
        setShowDelete(false);
        setCurrentProduct(null);
    }

    const handleDeleteItem = async()=>{
        try {
            if(!currentProduct) return;
            const res = await deleteProduct(currentProduct?._id);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            handleClose();
            if(!res.error){
                refetch();
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while deleting product', {variant:'error'});
        }
    }


    const content = currentProduct ? `Are you sure you want to delete product ${currentProduct.name} ? This action cannot be undone.` : '';

  return (
    <div className='table-main2' >
        <span className='font-bold text-xl' >Products</span>
        <ProductInfoModal infoMode={showInfo} setInfoMode={setShowInfo} currentProduct={currentProduct} setCurrentProduct={setCurrentProduct} />
        <DialogueAlet open={showDelete} handleClose={handleClose} agreeClick={handleDeleteItem} title="Delete Product" content={content} />
        <div className="flex w-full">
            {
                // loading ? 
                // <LinearProgrewss className='w-full' />
                // :
                <Paper className='w-full' sx={{ height: 'auto', }}>
                    <DataGrid
                        loading={isPending}
                        getRowId={(row:IProduct)=>row._id}
                        rows={products}
                        columns={ProductColumns(handleInfo, handleEdit, handleDelete)}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  org:false,
                                  uom: false,
                                  description: false,
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

export default ProductTable