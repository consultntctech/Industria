import { useFetchProducts } from "@/hooks/fetch/useFetchProducts"
import { IProduct } from "@/lib/models/product.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction,   useState } from "react"

type SearchSelectProductsProps = {
    setSelect?: Dispatch<SetStateAction<IProduct|null>>,
    value?: IProduct | null,
    width?: number,
    required?:boolean,
    type?:'Raw Material'|'Finished Good'
}
const SearchSelectProducts = ({setSelect, type, required, value, width}:SearchSelectProductsProps) => {
    const {products, isPending} = useFetchProducts(type);
    const [search, setSearch] = useState<string>( '' );




    return(
        <Autocomplete
            disablePortal
            options={products}
            onChange={(e, item:IProduct|null)=>{
                console.log(e.target)
                if(setSelect){
                    setSelect(item)
                }
            }}

            inputValue={search}
            defaultValue={value}
            onInputChange={(_, newInputValue) => {
                setSearch(newInputValue);
            }}
            loading={isPending}
            isOptionEqualToValue={(option, v)=>option._id === v._id}
            getOptionLabel={(option)=>option?.name}
            sx ={{width:width || '100%'}}
            renderInput={(params)=>(
                <TextField
                    {...params}
                    required={required}
                    size="small"
                    label= "Product"
                    color="primary"
                    className="rounded"
                    slotProps={{
                        input:{
                            ...params.InputProps,
                            endAdornment:(
                                <Fragment>
                                    {isPending ? <CircularProgress size={20} color="inherit" />: null}
                                    {params.InputProps.endAdornment}
                                </Fragment>
                            )
                        }
                    }}
                />
            )}
        >

        </Autocomplete>
    )
}

export default SearchSelectProducts