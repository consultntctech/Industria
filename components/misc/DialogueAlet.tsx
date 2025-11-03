import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"

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
        <DialogTitle id="alert-dialog-title">
          {title}
        </DialogTitle>
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