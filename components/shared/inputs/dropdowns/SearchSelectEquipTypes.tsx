import { useFetchETypes } from "@/hooks/fetch/useFetchETypes";
import { IEType } from "@/lib/models/etype.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectEquipTypesProps = {
    setSelect?: Dispatch<SetStateAction<IEType | null>>,
    value?: IEType | null,
    width?: number,
    required?:boolean,
}
const SearchSelectEquipTypes = ({setSelect, required, value, width}:SearchSelectEquipTypesProps) => {
    const {types, isPending} = useFetchETypes();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={types}
            onChange={(_, item:IEType|null)=>{
                // console.log(e.target)
                if(setSelect){
                    setSelect(item)
                }
            }}

            inputValue={search}
            onInputChange={(_, item)=>{
                // console.log(e.target);
                setSearch(item);
            }}
            defaultValue={value}
            loading={isPending}
            isOptionEqualToValue={(option, v)=>option._id === v._id}
            getOptionLabel={(option)=>option?.name}
            sx ={{width:width || '100%'}}
            renderInput={(params)=>(
                <TextField
                    {...params}
                    required={required}
                    size="small"
                    label= "Type"
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

export default SearchSelectEquipTypes