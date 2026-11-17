import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from "@mui/material"
import { IoClose } from "react-icons/io5";

type DialogueAletProps = {
    open:boolean;
    handleClose:()=>void;
    agreeClick:()=>Promise<void>;
    title:string;
    content:string;
    agreeText?:string;
    disagreeText?:string;
}

const DialogueAlet = ({open, handleClose, agreeClick, title, content, agreeText="Proceed", disagreeText="Cancel"}:DialogueAletProps) => {
  return (
    <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ pr: 6 }}>
          {title}
        </DialogTitle>
        <IconButton aria-label="Close" onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}>
            <IoClose />
        </IconButton>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{disagreeText}</Button>
          <Button onClick={agreeClick} autoFocus>
            {agreeText}
          </Button>
        </DialogActions>
      </Dialog>
  )
}

export default DialogueAlet