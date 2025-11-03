import { useFetchProdCats } from "@/hooks/fetch/useFetchProdCats"
import { ICategory } from "@/lib/models/category.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectProdCatsProps = {
    setSelect?: Dispatch<SetStateAction<string>>,
    value?: string,
    width?: number,
    required?:boolean,
}
const SearchSelectProdCats = ({setSelect, required, value, width}:SearchSelectProdCatsProps) => {
    const {categories, isPending} = useFetchProdCats();
    const [search, setSearch] = useState<string>('');

    return(
        <Autocomplete
            disablePortal
            options={categories}
            onChange={(e, item:ICategory|null)=>{
                console.log(e.target)
                if(setSelect){
                    setSelect(item?._id as string)
                }
            }}

            inputValue={search}
            onInputChange={(e, item)=>{
                console.log(e.target);
                setSearch(item);
            }}
            loading={isPending}
            isOptionEqualToValue={(option, value)=>option._id === value._id}
            getOptionLabel={(option)=>option?.name}
            sx ={{width:width || '100%'}}
            renderInput={(params)=>(
                <TextField
                    {...params}
                    required={required}
                    size="small"
                    label= "Category"
                    color="primary"
                    defaultValue={value}
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

export default SearchSelectProdCats