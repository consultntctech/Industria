import { PACKAGING_PROCESSES, TPackagingProcess } from '@/Data/PackagingProcesses';
import { TextField } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { Dispatch, SetStateAction } from 'react';

type SearchSelectPackagingTypeProps = {
    value: TPackagingProcess | null;
    setValue: Dispatch<SetStateAction<TPackagingProcess | null>>;
    dfValue?: TPackagingProcess | null;
    width?: number;
}

const filter = createFilterOptions<TPackagingProcess>();

export default function SearchSelectPackagingType({ value, width, setValue, dfValue }: SearchSelectPackagingTypeProps) {

  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => {
        if (typeof newValue === 'string') {
          setValue({
            label: newValue,
          });
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue({
            label: newValue.inputValue,
          });
        } else {
          setValue(newValue);
        }
      }}
      defaultValue={dfValue}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option.label);
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            inputValue,
            label: `Add "${inputValue}"`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={PACKAGING_PROCESSES}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.label;
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            {option.label}
          </li>
        );
      }}
      sx={{ width: width || '100%' }}
      freeSolo
      renderInput={(params) => (
        <TextField  {...params} size='small' label="Packaging type" />
      )}
    />
  );
}