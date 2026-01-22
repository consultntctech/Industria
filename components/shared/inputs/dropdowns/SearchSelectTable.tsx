// import { useFetchAvailableGoods } from "@/hooks/fetch/useFetchGoods"
// import { ITable } from "@/lib/models/good.model"
import { isGlobalAdmin, isSystemAdmin } from "@/Data/roles/permissions"
import { TableData } from "@/Data/roles/table"
import { useAuth } from "@/hooks/useAuth"
import { IRole } from "@/lib/models/role.model"
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

    const {user} = useAuth();
    const isAdmin = isSystemAdmin(user);
    const isGlobal = isGlobalAdmin(user?.roles as IRole[]);
    const admin = isAdmin || isGlobal;

    const gloAdmin:ITable = {
        id:'15',
        name: 'Global Admin',
        description: 'Everything in the organization'
    }

    return(
        <Autocomplete
            disablePortal
            options={admin ? [gloAdmin, ...TableData]: TableData}
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