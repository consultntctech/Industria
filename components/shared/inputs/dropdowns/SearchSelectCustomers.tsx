import { useFetchCustomers } from "@/hooks/fetch/useFetchCustomers"
import { ICustomer } from "@/lib/models/customer.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectCustomersProps = {
    setSelect: Dispatch<SetStateAction<ICustomer | null>>,
    value?: ICustomer | null,
    width?: number,
    required?:boolean,
}
const SearchSelectCustomers = ({setSelect, required, value, width}:SearchSelectCustomersProps) => {
    const {customers, isPending} = useFetchCustomers();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={customers}
            onChange={(_, item:ICustomer|null)=>{
                // console.log(e.target)
                if(setSelect){
                    setSelect(item)
                }
            }}
            defaultValue={value}
            inputValue={search}
            onInputChange={(_, item)=>{
                setSearch(item);
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
                    label= "Customer"
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

export default SearchSelectCustomers