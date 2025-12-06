import {  useFetchBatchesWithRMaterials } from "@/hooks/fetch/useBatches"
import { IBatch } from "@/lib/models/batch.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectBatchesWithRMProps = {
    setSelect?: Dispatch<SetStateAction<string>>,
    value?: IBatch | null,
    width?: number,
    required?:boolean,
    // type?:'Raw Material'|'Finished Good'
}
const SearchSelectBatchesWithRM = ({setSelect,  required, value, width}:SearchSelectBatchesWithRMProps) => {
    const {batches, isPending} = useFetchBatchesWithRMaterials();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={batches}
            onChange={(e, item:IBatch|null)=>{
                console.log(e.target)
                if(setSelect){
                    setSelect(item?._id as string)
                }
            }}
            defaultValue={value}
            inputValue={search}
            onInputChange={(_, item)=>{
                setSearch(item);
            }}
            loading={isPending}
            isOptionEqualToValue={(option, value)=>option._id === value._id}
            getOptionLabel={(option)=>option?.code}
            sx ={{width:width || '100%'}}
            renderInput={(params)=>(
                <TextField
                    {...params}
                    required={required}
                    size="small"
                    label= "Batch"
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

export default SearchSelectBatchesWithRM