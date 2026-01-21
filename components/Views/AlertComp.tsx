'use client'

import { AlertsData } from "@/Data/alerts"
import { Alert } from "@mui/material"
import { useState } from "react"
import { FaTrash } from "react-icons/fa"

type variantProps = 'filled' | 'outlined' | 'standard'

const AlertComp = () => {
    const [variant, setVariant] = useState<variantProps>('filled');
    const handleDelete = (id: string) => {
        AlertsData.filter((alert)=>alert._id !== id)
    }
  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
        <div className="flex flex-row items-start gap-2 self-end w-fit">
            <span className="greyText">Display variant:</span>
            <select onChange={(e)=>setVariant(e.target.value as variantProps)} className="w-fit px-2 py-1 rounded border border-slate-300 outline-0" >
                <option value="filled">Filled</option>
                <option value="standard">Standard</option>
                <option value="outlined">Outlined</option>
            </select>
        </div>
        {
            AlertsData?.length === 0 &&
            <div className="flex flex-col gap-2">
                <span className="subtitle">You don't have any alerts currently</span>
                <span className="greyText">Alerts are triggered when certain events occur in your organization, such as low stock.</span>
            </div>
        }
        <div className="flex flex-col gap-3">
            {
                AlertsData?.map((alert, index)=>{
                    return (
                        <Alert variant={variant} key={index} severity={alert?.type}  className="rounded relative shadow-md border border-slate-200 p-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-lg font-semibold">{alert?.title}</span>
                                <span className="text-sm font-light">{alert?.body}</span>
                            </div>
                            <FaTrash onClick={()=>handleDelete(alert?._id as string )}  className="absolute top-2 right-2 cursor-pointer" />
                        </Alert>
                    )
                })
            }
        </div>
    </div>
  )
}

export default AlertComp