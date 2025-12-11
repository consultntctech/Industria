// import { useFetchAvailableGoods } from "@/hooks/fetch/useFetchGoods"
// import { ITable } from "@/lib/models/good.model"
import { TableData } from "@/Data/roles/table"
import { ITable } from "@/types/Types"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectTableProps = {
    setSelect?: Dispatch<SetStateAction<ITable | null>>,
    value?: ITable | null,
    width?: number,
    required?:boolean,
}
const SearchSelectTable = ({setSelect, required, value, width}:SearchSelectTableProps) => {
    // const {goods, isPending} = useFetchAvailableGoods();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={TableData}
            onChange={(_, item:ITable|null)=>{
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
            loading={!TableData}
            isOptionEqualToValue={(option, v)=>option.id === v.id}
            getOptionLabel={(option)=>option?.name}
            sx ={{width:width || '100%'}}
            renderInput={(params)=>(
                <TextField
                    {...params}
                    required={required}
                    size="small"
                    label= "Table"
                    color="primary"
                    className="rounded"
                    slotProps={{
                        input:{
                            ...params.InputProps,
                            endAdornment:(
                                <Fragment>
                                    {!TableData ? <CircularProgress size={20} color="inherit" />: null}
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

export default SearchSelectTable