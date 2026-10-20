'use client'
import Link from "next/link"
import PrivacyConsentModal from "./PrivacyConsentModal";
import { useSettings } from "@/config/useSettings";
import { brand } from "@/Data/constants";
import { useAuth, useIsGlobalAdmin } from "@/hooks/useAuth";
import { enqueueSnackbar } from "notistack";
import { acceptOrgTerms } from "@/lib/actions/org.action";
import { useState } from "react";

export const Footer = () => {

  const [open, setOpen] = useState(false);
  const { org, appName, primaryColour, refetch } = useSettings();
  const { user } = useAuth();
  const isGlobal = useIsGlobalAdmin();

  const validateShow=():boolean =>{
    if(!org) return false;

    if(!org?.hasAgreedTerms && isGlobal) return true;
    else return open
  }

  const handleAccept = async () => {
    if (!user || !org) return;
    
    const res = await acceptOrgTerms(org?._id);
    enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
    if(!res.error){
      refetch();
      setOpen(false);
    }
  };

  return (
    <footer className="border-t border-slate-300 p-4 w-full flex-center" >
      <PrivacyConsentModal
        orgName={org?.name ?? ''}
        appName={appName ?? brand?.name}
        contactEmail={brand?.email}
        primaryColour={primaryColour}
        open={validateShow()}
        showDecline={org?.hasAgreedTerms}
        showAccept={!org?.hasAgreedTerms}
        onDecline={()=>{
          setOpen(false);
        }}
        declineText="Close"
        onAccept={handleAccept}
      />
      <div className="flex-center gap-4 flex-col md:flex-row">
        <div className="flex-center gap-2 flex-row">
          <span className="font-extralight" >&copy;</span>
          <span className="font-extralight" >{new Date()?.getFullYear()}</span>
          <Link className="font-extralight underline" target="_blank" href="https://sesatechafrica.com/">Sesa Technology Africa</Link>
        </div>

        <span onClick={()=>setOpen(true)}  className="font-light underline cursor-pointer" >Privacy Policy</span>
      </div>
    </footer>
  )
}
