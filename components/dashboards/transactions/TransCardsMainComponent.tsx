'use client'
import { useFetchTransactMonthly } from "@/hooks/fetch/useFetchStats";
import TransCard from "./TransCard";
import { TransCardsData } from "./TransCardsData"
import { IYearMonth } from "@/types/Types";
import { useState } from "react";
import SearchSelectMonthYear from "@/components/shared/inputs/dropdowns/SearchSelectMonthYear";
import { LinearProgress } from "@mui/material";

type QuanityOrPrice = "quantity" | "price";

const TransCardsMainComponent = () => {
    const [monthYear, setMonthYear] = useState<IYearMonth | null>(null);
    const [type, setType] = useState<QuanityOrPrice>("quantity");
    const {transactMontly, isPending} = useFetchTransactMonthly( monthYear?.id, monthYear?.year, type);
    const data = TransCardsData(transactMontly, monthYear?.id, monthYear?.year, type);

    // console.log('monthyear: ', monthYear)
    // console.log('Transactions: ', transactMontly)
    // console.log('Type: ', type)

  return (
    <div className="flex flex-col gap-2.5 border border-slate-200 shadow p-4 rounded-xl">
        {
            isPending ?
            <LinearProgress className='w-full' />
            :
            <>
                <div className="flex flex-col gap-5 w-full">
                    <span className="semibold">Orders & Returns (count of product quantity)</span>
                    <div className="flex self-end flex-col sm:flex-row items-start sm:items-center gap-2.5">
                        <SearchSelectMonthYear setSelect={setMonthYear} width={150} />
                        <select onChange={(e)=>setType(e.target.value as QuanityOrPrice)} className={`outline-none border-1 border-gray-300 rounded px-4 py-[0.45rem]`}  >
                            <option  value="quantity">Quantity</option>
                            <option value="price">Value</option>
                        </select>
                    </div>
                </div>
                <div className="w-full flex flex-row items-center flex-wrap gap-4 justify-between" >
                    {
                        data.map((item, index)=>(
                            <TransCard key={index} item={item} />
                        ))
                    }
                </div>
            </>
        }
    </div>
  )
}

export default TransCardsMainComponent