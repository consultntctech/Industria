'use client'
import { ICustomer } from "@/lib/models/customer.model";
import { useState } from "react";
import CustomTabs from "../misc/CustomTabs";
import { useFetchCustomerItems } from "@/hooks/fetch/useFetchCustomers";
import CustomerSalesTable from "../shared/outputs/customerDetials/customerSales/CustomerSalesTable";
import CustomerOrdersTable from "../shared/outputs/customerDetials/customerOrders/CustomerOrdersTable";
import CustomerReturnsTable from "../shared/outputs/customerDetials/customerReturns/CustomerReturnsTable";

type SingleCustomerCompProps = {
    customer:ICustomer | null
}

const SingleCustomerComp = ({customer}:SingleCustomerCompProps) => {
    const [activeTab, setActiveTab] = useState('first');
    const {sales, orders, returns, isPending} = useFetchCustomerItems(customer?._id || '');
    // console.log(customerItems);
    // if(!customerItems) return null;
  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
        <CustomTabs 
          FirstTabText="Sales" activeTab={activeTab} 
          onClickFirstTab={()=>setActiveTab('first')}
          SecondTabText="Orders" onClickSecondTab={()=>setActiveTab('second')} showSecondTab
          ThirdTabText="Returns" onClickThirdTab={()=>setActiveTab('third')} showThirdTab
        //   FourthTabText="Line Items" onClickFourthTab={()=>setActiveTab('fourth')} showFourthTab
        />
  
         {
          activeTab === 'first' &&
          <CustomerSalesTable   isPending={isPending} sales={sales} />
        }
        {
          activeTab === 'second' &&
          <CustomerOrdersTable orders={orders} isPending={isPending} />
        }
        
         {
          activeTab === 'third' &&
          <CustomerReturnsTable isPending={isPending} returns={returns} />
        }
        {/*
        {
          activeTab === 'fourth' &&
          <LineItemsTable  pack={currentPackage} />
        }
       */}
      </div>
  )
}

export default SingleCustomerComp