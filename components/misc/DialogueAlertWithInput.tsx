import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, IconButton } from "@mui/material"
import { IoClose } from "react-icons/io5";
import { ComponentProps } from "react";

type DialogueAlertWithInputProps = {
    open:boolean;
    handleClose:()=>void;
    agreeClick:()=>Promise<void>;
    title:string;
    content:string;
    agreeText?:string;
    disagreeText?:string;
} & ComponentProps<typeof TextField>

const DialogueAlertWithInput = ({open, handleClose, agreeClick, title, content, agreeText="Proceed", disagreeText="Cancel", ...props}:DialogueAlertWithInputProps) => {
  return (
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ pr: 6 }}>{title}</DialogTitle>
        <IconButton aria-label="Close" onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}>
            <IoClose />
        </IconButton>
        <DialogContent>
          <DialogContentText>
            {content}
          </DialogContentText>
            <form id="subscription-form">
              <TextField
                {...props}
                autoFocus
                required
                margin="dense"
                id="name"
                name="dataInput"
                fullWidth
                variant="standard"
              />
            </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{disagreeText}</Button>
          <Button onClick={agreeClick}  form="subscription-form">
            {agreeText}
          </Button>
        </DialogActions>
      </Dialog>
  )
}

export default DialogueAlertWithInput