import { useFetchProductSuppliers } from "@/hooks/fetch/useFetchSuppliers";
import { ISupplier } from "@/lib/models/supplier.model";
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectLtdSuppliersProps = {
    productId:string;
    setSelect?: Dispatch<SetStateAction<string>>,
    value?: ISupplier | null,
    width?: number,
    required?:boolean,
}
const SearchSelectLtdSuppliers = ({setSelect, productId, required, value, width}:SearchSelectLtdSuppliersProps) => {
    const {suppliers, isPending} = useFetchProductSuppliers(productId);
    const [search, setSearch] = useState<string>('');


    return(
        <Autocomplete
            disablePortal
            options={suppliers}
            onChange={(_, item:ISupplier|null)=>{
                // console.log(e.target)
                if(setSelect){
                    setSelect(item?._id as string)
                }
            }}
            defaultValue={value}
            inputValue={search}
            onInputChange={(_, item)=>{
                // console.log(e.target);
                setSearch(item);
            }}
            loading={!!productId && isPending}
            isOptionEqualToValue={(option, v)=>option._id === v._id}
            getOptionLabel={(option)=>option?.name}
            sx ={{width:width || '100%'}}
            renderInput={(params)=>(
                <TextField
                    {...params}
                    required={required}
                    size="small"
                    label= "Supplier"
                    color="primary"
                    // defaultValue={value}
                    className="rounded"
                    slotProps={{
                        input:{
                            ...params.InputProps,
                            endAdornment:(
                                <Fragment>
                                    {(!!productId && isPending) ? <CircularProgress size={20} color="inherit" />: null}
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

export default SearchSelectLtdSuppliers