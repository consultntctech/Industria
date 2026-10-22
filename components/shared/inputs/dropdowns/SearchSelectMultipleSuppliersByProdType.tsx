import { ISupplier } from "@/lib/models/supplier.model"
import { Dispatch, Fragment, SetStateAction, useState } from "react"
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Checkbox, Chip, CircularProgress, TextField } from "@mui/material";
import { useFetchProdTypesSuppliers } from "@/hooks/fetch/useFetchProdTypes";


type SearchSelectMultipleSuppliersByProdTypeProps = {
    setSelection:Dispatch<SetStateAction<ISupplier[]>>;
    typeId: string | undefined;
    // selection:string[];
    // fixedSelection?:ISupplier[];
    width?:number;
    required?:boolean;
    value?:ISupplier[];
    placeholder?:string;
    disabled?: boolean;
}

const SearchSelectMultipleSuppliersByProdType = ({setSelection, typeId, disabled, width, required, value, placeholder}:SearchSelectMultipleSuppliersByProdTypeProps) => {
    const [search, setSearch] = useState<string>('');
    const {suppliers, isPending} = useFetchProdTypesSuppliers(typeId as string);
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

  return (
    <Autocomplete
        disableCloseOnSelect
        multiple
        filterSelectedOptions
        disabled={disabled}
        options={suppliers}
        onChange={(_, items:ISupplier[])=>{
            // const fixed = fixedSelection ?? [];
            // const uniqueSelection = items.filter(
            //     (option)=>!fixed.some((item)=>item._id === option._id)
            // )
            // const ids = items.map(item=>item._id)
            // setSelection([...fixed, ...uniqueSelection]);
            setSelection(items);
        }}
        defaultValue={value}
        inputValue={search}
        onInputChange={(_, v)=>setSearch(v)}
        // value={selection ?? []}
        loading={isPending && !!typeId}
        isOptionEqualToValue={(option, v)=>option?._id === v?._id}
        getOptionLabel={(option)=>option?.name}
        sx ={{width:width || '100%'}}

        renderValue={(tagValue, getTagProps)=>
            tagValue.map((option, index) => {
                const {key, ...tagProps} = getTagProps({index});

                return(
                    <Chip
                        {...tagProps}
                        key={key}
                        label={option.name}
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
                label= { placeholder || "Suppliers"}
                color="primary"
                // defaultValue={value}
                className="rounded"
                slotProps={{
                    input:{
                        ...params.InputProps,
                        endAdornment:(
                            <Fragment>
                                {(isPending && !!typeId) ? <CircularProgress size={20} color="inherit" />: null}
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

export default SearchSelectMultipleSuppliersByProdType