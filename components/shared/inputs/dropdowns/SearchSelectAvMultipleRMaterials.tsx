import { Dispatch, Fragment, SetStateAction, useState } from "react"
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Checkbox, Chip, CircularProgress, TextField } from "@mui/material";
import { IRMaterial } from "@/lib/models/rmaterial.mode";
import { useFetchAvailableRMaterialsByBatch } from "@/hooks/fetch/useRMaterials";
import { IProduct } from "@/lib/models/product.model";


type SearchSelectAvMultipleRMaterialsProps = {
    setSelection:Dispatch<SetStateAction<IRMaterial[]>>;
    batchId:string;
    // selection:string[];
    // fixedSelection?:ISupplier[];
    width?:number;
    required?:boolean;
    value?:string;
    disabled?:boolean;
} 

const SearchSelectAvMultipleRMaterials = ({setSelection, batchId,  width, required, value, disabled}:SearchSelectAvMultipleRMaterialsProps) => {
    const [search, setSearch] = useState<string>('');
    const {materials, isPending} = useFetchAvailableRMaterialsByBatch(batchId);
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

  return (
    <Autocomplete
        disabled={disabled}
        disableCloseOnSelect
        multiple
        filterSelectedOptions
        options={materials}
        onChange={(_, items:IRMaterial[])=>{
            // const fixed = fixedSelection ?? [];
            // const uniqueSelection = items.filter(
            //     (option)=>!fixed.some((item)=>item._id === option._id)
            // )
            if(setSelection){
                setSelection(items);
            }
          
        }}

        inputValue={search}
        onInputChange={(_, value)=>setSearch(value)}
        // value={selection ?? []}
        loading={isPending && !!batchId}
        isOptionEqualToValue={(option, value)=>option._id === value._id}
        getOptionLabel={(option)=>{
            const product = option?.product as IProduct;
            return `${product?.name} - ${option?.materialName}`;
        }}
        sx ={{width:width || '100%'}}

        renderValue={(tagValue, getTagProps)=>
            tagValue.map((option, index) => {
                const product = option?.product as IProduct;
                const {key, ...tagProps} = getTagProps({index});

                return(
                    <Chip
                        {...tagProps}
                        key={key}
                        label={`${product?.name} - ${option?.materialName}`}
                        // disabled={!!fixedSelection?.find((item)=>item._id === option._id)}
                    />
                )
            })
        }

        renderOption={(props, option, {selected}) =>{
            const {key, ...optionProps} = props;
            const product = option?.product as IProduct;

            return(
                <li key={key} {...optionProps} >
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        checked={selected}
                        style = {{marginRight:8}}
                    />
                    {`${product?.name} - ${option?.materialName}`}
                </li>
            );
        }}

        renderInput={(params)=>(
            <TextField
                {...params}
                required={required}
                size="small"
                label= "Raw Materials"
                color="primary"
                defaultValue={value}
                className="rounded"
                slotProps={{
                    input:{
                        ...params.InputProps,
                        endAdornment:(
                            <Fragment>
                                {(isPending && !!batchId) ? <CircularProgress size={20} color="inherit" />: null}
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

export default SearchSelectAvMultipleRMaterials