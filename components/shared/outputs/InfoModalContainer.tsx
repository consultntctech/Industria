import { Modal } from "@mui/material"
import { ReactNode } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import '@/styles/customscroll.css';

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
        <div className="flex flex-col min-w-72 h-full bg-white rounded-l-lg p-4 overflow-y-scroll scrollbar-custom">
            <div onClick={handleClose}  className="flex gap-1 cursor-pointer items-center mb-5">
               <IoIosArrowRoundBack size={24} /> 
               <span>Close</span>
            </div>

              {children}
        </div>
    </Modal>
  )
}

export default InfoModalContainer