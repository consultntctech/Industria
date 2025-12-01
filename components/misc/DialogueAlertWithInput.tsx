import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material"
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
        <DialogTitle>{title}</DialogTitle>
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