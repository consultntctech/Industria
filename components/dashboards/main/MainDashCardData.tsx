import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { CardProps, IDashboardStats } from "@/types/Types";
import { BiStats } from "react-icons/bi";
import { CiBag1, CiDeliveryTruck, CiMoneyBill } from "react-icons/ci";
import { FaChartLine } from "react-icons/fa";
import { MdMultilineChart } from "react-icons/md";
import { TbCashBanknoteOff, TbTruckOff } from "react-icons/tb";

export const MainDashCardData = (stat:IDashboardStats | null | undefined):Partial<CardProps>[] => {
    const {currency} =useCurrencyConfig();
    return[
        {
            title:'Raw Materials',
            centerText: `${stat?.rawMaterials} units`,
            bottomText: 'Raw materials in stock',
            titleIcon: <CiBag1 className='text-blue-500' />
        },
        {
            title:'Production Output',
            centerText:`${stat?.productionOutput} units`,
            bottomText:'Goods available for sale',
            titleIcon: <FaChartLine className='text-blue-500' />
        },
        {
            title:'Production Rejects',
            centerText:`${stat?.rejectedPercent}%`,
            bottomText:'Rejected production outputs',
            titleIcon: <MdMultilineChart className='text-blue-500' />
        },
        {
            title:'Orders in Progress',
            centerText:`${stat?.ordersInProgress}`,
            bottomText:'Pending orders being processed',
            titleIcon: <CiDeliveryTruck className='text-blue-500' />
        },
        {
            title: 'Delayed Orders',
            centerText: `${stat?.ordersDelayed}`,
            bottomText: 'Orders beyond deadline',
            titleIcon: <TbTruckOff className='text-blue-500' />
        },
        {
            title: 'Fulffilled Orders',
            centerText: `${stat?.orderFulfillmentStatus}%`,
            bottomText: 'Orders fulf. status for the month',
            titleIcon: <BiStats   className='text-blue-500' />
        },
        {
            title: 'Sales',
            centerText: `${currency?.symbol || ''} ${stat?.sales}`,
            bottomText: 'All time sales revenue',
            titleIcon: <CiMoneyBill className='text-blue-500' />
        },
        {
            title:'Returns',
            centerText: `${currency?.symbol || ''} ${stat?.returns}`,
            bottomText:'All time returns',
            titleIcon: <TbCashBanknoteOff className='text-blue-500' />
        }
    ]
}