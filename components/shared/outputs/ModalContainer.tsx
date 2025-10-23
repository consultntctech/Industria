import { Modal } from "@mui/material"
import { ReactNode } from "react";

type ModalContainerProps = {
    open:boolean;
    handleClose:()=>void;
    children:ReactNode
}

const ModalContainer = ({open, handleClose, children}:ModalContainerProps) => {
  return (
    <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <div className="flex h-[100vh] w-full items-center justify-center">
            {children}
        </div>
    </Modal>
  )
}

export default ModalContainer