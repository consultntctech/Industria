import { useFetchProdCats } from "@/hooks/fetch/useFetchProdCats"
import { ICategory } from "@/lib/models/category.model"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

type SearchSelectProdCatsProps = {
    setSelect?: Dispatch<SetStateAction<string>>,
    value?: ICategory | null,
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
            onChange={(_, item:ICategory|null)=>{
                // console.log(e.target)
                if(setSelect){
                    setSelect(item?._id as string)
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

export default SearchSelectProdCats