import { useFetchTransConfig } from "@/hooks/fetch/useFetchTransConfig";
import { useAuth, useCanUser } from "@/hooks/useAuth";
import { CTrans, ITransConfig } from "@/lib/models/transconfig.model";
import { LinearProgress, Switch, Tooltip } from "@mui/material";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import InputWithLabel from "../shared/inputs/InputWithLabel";
import { enqueueSnackbar } from "notistack";
import { generateCodePreview } from "@/functions/helpers";
import PrimaryButton from "../shared/buttons/PrimaryButton";
import {  updateTransConfig } from "@/lib/actions/transconfig.action";

const TransConfigComp = () => {
    const [loading, setLoading] = useState(false);
    const [invoiceConfig, setInvoiceConfig] = useState(false);
    const [orderConfig, setOrderConfig] = useState(false);
    const [invoiceData, setInvoiceData] = useState<Partial<CTrans>>({});
    const [orderData, setOrderData] = useState<Partial<CTrans>>({});
    const [invoiceRandom, setInvoiceRandom] = useState(false);
    const [orderRandom, setOrderRandom] = useState(false);
    
    const {config, isLoading, refetch} = useFetchTransConfig();
    const {user} = useAuth();
    const formRef = useRef<HTMLFormElement>(null);
    const isConfigurer = useCanUser('48', 'UPDATE');
    const isConfigAdmin = useCanUser('48', 'CREATE');



    const invPreview = generateCodePreview(
      Number(invoiceData?.length ?? 0), invoiceData?.prefix, invoiceData?.suffix
    )

    const orPreview = generateCodePreview(
      Number(orderData?.length ?? 0), orderData?.prefix, orderData?.suffix
    )

    const handleInvoiceChange = (e:ChangeEvent<HTMLInputElement>)=>{
      setInvoiceData((prev)=>{
        const {name, value} = e.target;
        return {...prev, [name]:value}
      })
    }

    // useEffect(()=>{
    //   const fetchitem = async()=>{
    //     const res = await getSalesOrder("6ab3a9c851e5bb29972dd9ad");
    //     console.log('Result: ', res.payload)
    //     // const res = await updateAllOrgTransConfig()
    //     // enqueueSnackbar(res?.message, {variant:res?.error ? 'error':'success'})
    //   }

    //   fetchitem()
    // },[])

    // console.log('Invoice Data :', config)
    const handleSalesOrderChange = (e:ChangeEvent<HTMLInputElement>)=>{
      setOrderData((prev)=>{
        const {name, value} = e.target;
        return {...prev, [name]:value}
      })
    }

    useEffect(()=>{
      if(config){
        setInvoiceData(config?.invoice);
        setOrderData(config?.salesOrder);
        setInvoiceConfig(config?.invoice?.useConfig);
        setInvoiceRandom(config?.invoice?.auto);
        setOrderConfig(config?.salesOrder?.useConfig);
        setOrderRandom(config?.salesOrder?.auto);
      }
    },[config])

    const handleSubmit = async(e: FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      try {
        setLoading(true);
        if(!config || !user) return;
        const data:Partial<ITransConfig> = {
          _id: config?._id,
          org: user?.org,
          invoice:{...invoiceData, useConfig:invoiceConfig} as CTrans,
          salesOrder: {...orderData, useConfig:orderConfig} as CTrans,
        }
        const res = await updateTransConfig(data);
        enqueueSnackbar(res?.message, {variant: res?.error ? 'error' : 'success'});
        if(!res?.error){
          refetch();
        }
      } catch (error) {
        console.log(error);
        enqueueSnackbar('Error occurred saving configuration', {variant:'error'});
      }finally{
        setLoading(false);
      }
    }

    
  return (
    <form ref={formRef} onSubmit={handleSubmit}  className={`flex p-4 lg:p-8 gap-6 rounded-2xl w-full flex-col`}>
      {
        (isLoading || !config) ? 
        <LinearProgress className='w-full' />
        :
        <div className="flex flex-col items-start w-full gap-4" >
          <div className="flex flex-col gap-6 w-full md:w-4/5">
            <div   className="formBox p-4 flex-col gap-8 w-full" >

                <div className="flex flex-col gap-1">
                    <span className="title" >Set up invoice number</span>
                    <span className="greyText" >The configuration here is for the invoice number, not the invoice itself</span>
                </div>
                {
                  
                  <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                      <div className="flex gap-4 flex-col w-full">
                        <div className="flex items-center flex-row gap-4">
                          <span className="smallText">Use configuration</span>
                          <Tooltip title='Decide to enter invoice manually or generated' >
                            <Switch onChange={(e)=>setInvoiceConfig(e.target.checked)} defaultChecked={invoiceConfig} checked={invoiceConfig} color="primary" />
                          </Tooltip>
                        </div>
                        <InputWithLabel disabled={!invoiceConfig} type="number" min={3} max={10} required defaultValue={config?.invoice?.length} onChange={handleInvoiceChange} name="length"  placeholder="eg. 5" label="Length (without suffix and prefix)" className="w-full" />
                        <InputWithLabel disabled={!invoiceConfig} defaultValue={config?.invoice?.prefix} onChange={handleInvoiceChange} name="prefix"  placeholder="eg. IV" label="Prefix" className="w-full" />
                        <InputWithLabel disabled={!invoiceConfig} defaultValue={config?.invoice?.suffix} onChange={handleInvoiceChange} name="suffix"  placeholder="eg. XY" label="Suffix" className="w-full" />
                        
                        <div className="flex items-center flex-row gap-4">
                          <span className="smallText">Generate randomly</span>
                          <Tooltip title='The length will be expanded if the maximum invoice number is already generated' >
                            <Switch disabled={!invoiceConfig} onChange={(e)=>setInvoiceRandom(e.target.checked)} defaultChecked={config?.invoice?.auto} checked={invoiceRandom} color="primary" />
                          </Tooltip>
                        </div>
                        <InputWithLabel disabled value={invPreview}  placeholder="eg. 00001" label="Preview" className="w-full" />
                      {/* {
                        (isConfigurer || isConfigAdmin) &&
                        <PrimaryButton loading={loading} type="submit" text={loading?"saving" : "Save"} className="w-fit px-4 mt-4" />
                      } */}
                      </div>
                  </div>
                }
        
                
            </div>

            <div   className="formBox p-4 flex-col gap-8 w-full" >

                <div className="flex flex-col gap-1">
                    <span className="title" >Set up Sales Order number</span>
                    <span className="greyText" >Configure the format of sales order in your orgainzation</span>
                </div>
                {
            
                  <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                      <div className="flex gap-4 flex-col w-full">
                        <div className="flex items-center flex-row gap-4">
                          <span className="smallText">Use configuration</span>
                          <Tooltip title='Decide to enter sales order manually or generated' >
                            <Switch onChange={(e)=>setOrderConfig(e.target.checked)} defaultChecked={config?.salesOrder?.useConfig} checked={orderConfig} color="primary" />
                          </Tooltip>
                        </div>
                        <InputWithLabel type="number" min={3} max={10} disabled={!orderConfig} required defaultValue={config?.salesOrder?.length} onChange={handleSalesOrderChange} name="length"  placeholder="eg. 5" label="Length (without suffix and prefix)" className="w-full" />
                        <InputWithLabel disabled={!orderConfig} defaultValue={config?.salesOrder?.prefix} onChange={handleSalesOrderChange} name="prefix"  placeholder="eg. SO" label="Prefix" className="w-full" />
                        <InputWithLabel disabled={!orderConfig} defaultValue={config?.salesOrder?.suffix} onChange={handleSalesOrderChange} name="suffix"  placeholder="eg. YZ" label="Suffix" className="w-full" />
                        
                        <div className="flex items-center flex-row gap-4">
                          <span className="smallText">Generate randomly</span>
                          <Tooltip title='The length will be expanded if the maximum sales order number is already generated' >
                            <Switch disabled={!orderConfig} onChange={(e)=>setOrderRandom(e.target.checked)} defaultChecked={config?.salesOrder?.auto} checked={orderRandom} color="primary" />
                          </Tooltip>
                        </div>
                        <InputWithLabel disabled value={orPreview}  placeholder="eg. 0001" label="Preview" className="w-full" />
                      {/* {
                        (isConfigurer || isConfigAdmin) &&
                        <PrimaryButton loading={loading} type="submit" text={loading?"saving" : "Save"} className="w-fit px-4 mt-4" />
                      } */}
                      </div>
                  </div>
                }
        
                
            </div>
          </div>
          {
            (isConfigAdmin || isConfigurer) &&
            <PrimaryButton type="submit" loading={loading} text={loading ? 'laoding' : "Save"} className="w-full md:w-1/2 self-center md:self-start" />
          }
        </div>
      }
    </form>
  )
}

export default TransConfigComp