import { Modal } from "@mui/material"
import { ReactNode } from "react";
import '@/styles/customscroll.css';
import CloseButton from "@/components/misc/CloseButton";

type InfoModalContainerProps = {
    handleClose:()=>void;
    infoMode:boolean,
    children:ReactNode
}

const InfoModalContainer = ({handleClose, infoMode, children}:InfoModalContainerProps) => {
  return (
    <Modal
        open={infoMode}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className='flex size-full justify-end'
    >
        <div className="relative flex flex-col min-w-72 max-w-80 sm:max-w-96 h-full bg-white border-l border-gray-200 rounded-l-xl p-4 pt-12 overflow-y-auto scrollbar-custom shadow-xl">
            <CloseButton onClick={handleClose} className="top-3 right-3" />
            {children}
        </div>
    </Modal>
  )
}

export default InfoModalContainer
