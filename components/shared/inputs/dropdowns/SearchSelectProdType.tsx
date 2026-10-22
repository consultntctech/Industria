import { useFetchProdTypes } from "@/hooks/fetch/useFetchProdTypes";
import { IProdType } from "@/lib/models/prodtype.model";
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectProdTypeProps = {
    setSelect?: Dispatch<SetStateAction<IProdType | null>>,
    value?: IProdType | null,
    width?: number,
    required?:boolean,
    disabled?: boolean,
    placeholder?:string,
}
const SearchSelectProdType = ({ setSelect, required, disabled, placeholder, value, width}:SearchSelectProdTypeProps) => {
    const {prodTypes, isPending} = useFetchProdTypes();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            disabled={disabled}
            options={prodTypes}
            onChange={(_, item:IProdType|null)=>{
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
                    label= {placeholder || "Material type"}
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

export default SearchSelectProdType