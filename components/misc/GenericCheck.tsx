import { useSettings } from "@/config/useSettings";
import { Tooltip } from "@mui/material";
import {
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md";

type GenericCheckProps<T> = {
  checked: boolean;
  onClick: (item?: T) => void;
  item?: T;
  checkedTip?: string;
  uncheckedTip?: string;
};

const GenericCheck = <T,>({
  checked,
  onClick,
  item,
  checkedTip,
  uncheckedTip,
}: GenericCheckProps<T>) => {
  const { primaryColour, isSuccess } = useSettings();

  if (!isSuccess) return null;

  return checked ? (
    <Tooltip title={checkedTip || "Checked"}>
      <MdOutlineCheckBox
        color={primaryColour}
        onClick={() => onClick(item)}
        className="cursor-pointer"
      />
    </Tooltip>
  ) : (
    <Tooltip title={uncheckedTip || "Unchecked"}>
      <MdOutlineCheckBoxOutlineBlank
        color={primaryColour}
        onClick={() => onClick(item)}
        className="cursor-pointer"
      />
    </Tooltip>
  );
};

export default GenericCheck;