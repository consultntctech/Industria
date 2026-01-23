import { Dispatch, Fragment, SetStateAction, useState } from "react"
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Checkbox, Chip, CircularProgress, TextField } from "@mui/material";
import { IUser } from "@/lib/models/user.model";
import { useFetchUsers } from "@/hooks/fetch/useFetchUsers";


type SearchSelectMultipleUsersProps = {
    setSelection:Dispatch<SetStateAction<IUser[]>>;
    // selection:string[];
    // fixedSelection?:ISupplier[];
    width?:number;
    required?:boolean;
    value?:IUser[];
    showMe?:boolean;
    showAdmins?:boolean;
}

const SearchSelectMultipleUsers = ({setSelection, showMe, showAdmins, width, required, value}:SearchSelectMultipleUsersProps) => {
    const [search, setSearch] = useState<string>('');
    const {users, isPending} = useFetchUsers(showMe, showAdmins);
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    // console.log('IDS: ',users.map((item)=>item._id))

  return (
    <Autocomplete
        disableCloseOnSelect
        multiple
        filterSelectedOptions
        defaultValue={value}
        options={users}
        onChange={(_, items:IUser[])=>{
            // const fixed = fixedSelection ?? [];
            // const uniqueSelection = items.filter(
            //     (option)=>!fixed.some((item)=>item._id === option._id)
            // )
            // const ids = items.map(item=>item._id)
            // setSelection([...fixed, ...uniqueSelection]);
            setSelection(items);
        }}

        inputValue={search}
        onInputChange={(_, v)=>setSearch(v)}
        // value={selection ?? []}
        loading={isPending}
        isOptionEqualToValue={(option, v)=>option._id === v._id}
        getOptionLabel={(option)=>`${option?.name}`}
        sx ={{width:width || '100%'}}

        renderValue={(tagValue, getTagProps)=>
            tagValue.map((option, index) => {
                const {key, ...tagProps} = getTagProps({index});

                return(
                    <Chip
                        {...tagProps}
                        key={key}
                        label={`${option?.name}`}
                        // disabled={!!fixedSelection?.find((item)=>item._id === option._id)}
                    />
                )
            })
        }

        renderOption={(props, option, {selected}) =>{
            const {key, ...optionProps} = props;

            return(
                <li key={key} {...optionProps} >
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        checked={selected}
                        style = {{marginRight:8}}
                    />
                    {option.name}
                </li>
            );
        }}

        renderInput={(params)=>(
            <TextField
                {...params}
                required={required}
                size="small"
                label= "Users"
                color="primary"
                // defaultValue={value}
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
    />
  )
}

export default SearchSelectMultipleUsers