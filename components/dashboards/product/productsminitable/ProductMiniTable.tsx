import { Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { IProduct } from '@/lib/models/product.model'
import {  useFetchProductsWithStock } from '@/hooks/fetch/useFetchProducts'
import { ProductMiniColumns } from './ProductMiniColumns'


const ProductMiniTable = () => {
    const {products, isPending} = useFetchProductsWithStock();
    const paginationModel = { page: 0, pageSize: 15 };

  return (
    <div className='table-main2' >
        {/* <span className='font-bold text-xl' >Product Stocks</span> */}
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
                        columns={ProductMiniColumns()}
                        initialState={{ 
                            pagination: { paginationModel },
                            columns:{
                                columnVisibilityModel:{
                                  threshold: false,
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

export default ProductMiniTable