'use client'
import { IDepartment } from "@/lib/models/department.model";
import { useState } from "react";
import CustomTabs from "../misc/CustomTabs";
import { useFetchDepartmentUsers } from "@/hooks/fetch/useFetchUsers";
// import CustomerSalesTable from "../shared/outputs/departmentDetials/departmentSales/CustomerSalesTable";
// import CustomerOrdersTable from "../shared/outputs/departmentDetials/departmentOrders/CustomerOrdersTable";
// import CustomerReturnsTable from "../shared/outputs/departmentDetials/departmentReturns/CustomerReturnsTable";

type SingleDepartmentCompProps = {
    department:IDepartment | null
}

const SingleDepartmentComp = ({department}:SingleDepartmentCompProps) => {
    const [activeTab, setActiveTab] = useState('first');
    const {users, isPending} = useFetchDepartmentUsers(department?._id || '');
    console.log(users, isPending);
    // if(!departmentItems) return null;
  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
        <CustomTabs 
          FirstTabText="Details" activeTab={activeTab} 
          onClickFirstTab={()=>setActiveTab('first')}
          SecondTabText="Employees" onClickSecondTab={()=>setActiveTab('second')} showSecondTab
          ThirdTabText="Permissions" onClickThirdTab={()=>setActiveTab('third')} showThirdTab
        //   FourthTabText="Line Items" onClickFourthTab={()=>setActiveTab('fourth')} showFourthTab
        />
  
        {/* {
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
        
        {
          activeTab === 'fourth' &&
          <LineItemsTable  pack={currentPackage} />
        }
       */}
      </div>
  )
}

export default SingleDepartmentComp