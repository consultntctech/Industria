import { useFetchECategories } from "@/hooks/fetch/useFetchECategories";
import { IECategory } from "@/lib/models/ecategory.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectEquipCatsProps = {
    setSelect?: Dispatch<SetStateAction<IECategory | null>>,
    value?: IECategory | null,
    width?: number,
    required?:boolean,
}
const SearchSelectEquipCats = ({setSelect, required, value, width}:SearchSelectEquipCatsProps) => {
    const {categories, isPending} = useFetchECategories();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={categories}
            onChange={(_, item:IECategory|null)=>{
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
                    label= "Category"
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

export default SearchSelectEquipCats