'use client'

import { IPackageStats, QuanityOrPrice } from "@/types/Types";
import { LinearProgress } from "@mui/material"
import DistCard from "./DistCard";
import { PackageCardData } from "./PackageCardData";

type DistCardsMainComponentProps = {
    type: QuanityOrPrice;
    stats: IPackageStats | null | undefined;
    isPending: boolean;
}

const DistCardsMainComponent = ({type, stats, isPending}:DistCardsMainComponentProps) => {
    // console.log('Stats: ', stats);

    const data = PackageCardData(stats, type);

  return (
    <>
        {
            isPending ?
            <LinearProgress className='w-full' />
            :
            <div className="w-full flex flex-col md:flex-row items-center flex-wrap gap-4 md:justify-between" >
                {
                    data?.map((item, index)=>(
                        <DistCard key={index} item={item} />
                    ))
                }
            </div>
        }
    </>
  )
}

export default DistCardsMainComponent