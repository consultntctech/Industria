import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { IAllTimeStatusCount } from "@/types/EquipmentTypes";
import { QuanityOrPrice } from "@/types/Types";
import { LinearProgress } from "@mui/material";
import { MdOutlineChecklist } from "react-icons/md";
import EquipCard from "./EquipCard";

type EquipCardCompProps = {
    data: IAllTimeStatusCount;
    isPending: boolean;
    type: QuanityOrPrice;
}

const EquipCardComp = ({data, isPending, type}:EquipCardCompProps) => {
    const {currency} = useCurrencyConfig();
    // const availableData = data?.Available
    const inUseData = data?.['In Use']

    const available = {
        title: 'Available',
        titleIcon: <MdOutlineChecklist color="teal" />,
        centerText: type==='quantity'? `${data?.Available.count}` : ` ${currency?.symbol || ''} ${data?.Available?.price}`,
        bottomText: 'Equipment available for use',
    };

    const inUse = {
        title: 'In Use',
        titleIcon: <MdOutlineChecklist color="orange" />,
        centerText: type==='quantity'? `${inUseData?.count}` : ` ${currency?.symbol || ''} ${inUseData?.price}`,
        bottomText: 'Equipment in use',
    }

    const maintenance = {
        title: 'Maintenance',
        titleIcon: <MdOutlineChecklist color="red" />,
        centerText: type==='quantity'? `${data?.Maintenance.count}` : ` ${currency?.symbol || ''} ${data?.Maintenance?.price}`,
        bottomText: 'Equipment in maintenance',
    }
  return (
    <>
        {
            isPending ?
            <LinearProgress className='w-full' />
            :
            <div className="w-full flex flex-col md:flex-row items-center flex-wrap gap-4 md:justify-between" >
                <EquipCard item={available} />
                <EquipCard item={inUse} />
                <EquipCard item={maintenance} />
            </div>
        }
    </>
  )
}

export default EquipCardComp