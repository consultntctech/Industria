import {  useCanUser } from "@/hooks/useAuth"
import { ITablePermision } from "@/types/Types";
import { Tooltip } from "@mui/material";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { ComponentProps } from "react";
import { GoInfo, GoPencil } from "react-icons/go";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoSettingsOutline, IoTrashBinOutline } from "react-icons/io5";
import { LiaRedoAltSolid, LiaUndoAltSolid } from "react-icons/lia";
import { PiRadioButtonBold } from "react-icons/pi";
import { twMerge } from "tailwind-merge";

type LinkerProps = {
    link:Url,
    placeholder: string;
    linkStyle?: string;
    spanStyle?: string;
    target?: string;
} & ITablePermision

type ViewerProps = {
    tip: string;
} & ITablePermision & ComponentProps<'svg'>

export const Linker =({tableId, link, placeholder, operation='READ', linkStyle, spanStyle, target}:LinkerProps)=>{
    
    const isViewer = useCanUser(tableId, operation);

    return(
        <>
        {
            isViewer ?
            <Link  className={twMerge(`link`, linkStyle)} href={link} target={target} >{placeholder}</Link>
            :
            <span className={spanStyle} >{placeholder}</span>
        }
        </>
    )
}


export const Viewer =({tableId, operation='READ', tip, className, ...props}:ViewerProps)=>{
        const isViewer = useCanUser(tableId, operation);


    return(
        <>
        {
            isViewer ?
            <Tooltip title={tip}>
                <GoInfo {...props}   className={twMerge('cursor-pointer text-green-700', className)} />
            </Tooltip>
            :
            null
        }
        </>
    )
}


export const Editor =({tableId, operation='UPDATE', tip, className, ...props}:ViewerProps)=>{
        const editor = useCanUser(tableId, operation);


    return(
        <>
        {
            editor ?
            <Tooltip title={tip}>
                <GoPencil {...props}   className={twMerge('cursor-pointer text-blue-700', className)} />
            </Tooltip>
            :
            null
        }
        </>
    )
}


export const Fulfiller =({tableId, operation='UPDATE', tip, className, ...props}:ViewerProps)=>{
        const editor = useCanUser(tableId, operation);


    return(
        <>
        {
            editor ?
            <Tooltip title={tip}>
                <IoMdCheckmarkCircleOutline {...props}   className={twMerge('cursor-pointer text-blue-700', className)} />
            </Tooltip>
            :
            null
        }
        </>
    )
}


export const Deleter =({tableId, operation='DELETE', tip, className, ...props}:ViewerProps)=>{
        const deleter = useCanUser(tableId, operation);


    return(
        <>
        {
            deleter ?
            <Tooltip title={tip}>
                <IoTrashBinOutline {...props}   className={twMerge('cursor-pointer text-red-700', className)} />
            </Tooltip>
            :
            null
        }
        </>
    )
}


export const Approver =({tableId, operation='APPROVE', tip, className, ...props}:ViewerProps)=>{
        const approver = useCanUser(tableId, operation);


    return(
        <>
        {
            approver ?
            <Tooltip title={tip}>
                <IoSettingsOutline {...props}   className={twMerge('cursor-pointer text-blue-700', className)} />
            </Tooltip>
            :
            null
        }
        </>
    )
}


export const Redoer =({tableId, operation='UPDATE', tip, className, ...props}:ViewerProps)=>{
        const redoer = useCanUser(tableId, operation);


    return(
        <>
        {
            redoer ?
            <Tooltip title={tip}>
                <LiaRedoAltSolid {...props}   className={twMerge('cursor-pointer text-blue-700', className)} />
            </Tooltip>
            :
            null
        }
        </>
    )
}


export const Undoer =({tableId, operation='UPDATE', tip, className, ...props}:ViewerProps)=>{
        const under = useCanUser(tableId, operation);


    return(
        <>
        {
            under ?
            <Tooltip title={tip}>
                <LiaUndoAltSolid {...props}   className={twMerge('cursor-pointer text-blue-700', className)} />
            </Tooltip>
            :
            null
        }
        </>
    )
}


export const Assigner =({tableId, operation='UPDATE', tip, className, ...props}:ViewerProps)=>{
        const under = useCanUser(tableId, operation);


    return(
        <>
        {
            under ?
            <Tooltip title={tip}>
                <PiRadioButtonBold {...props}   className={twMerge('cursor-pointer text-blue-700', className)} />
            </Tooltip>
            :
            null
        }
        </>
    )
}