'use client'
import React, { useState } from 'react'
import CustomTabs from '../misc/CustomTabs'
import ProdApprovalTable from '../tables/approvals/ProdApprovalTable';

const ApprovalComp = () => {
    const [activeTab, setActiveTab] = useState<string>('first');
  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
      <CustomTabs 
        FirstTabText="Production" activeTab={activeTab} onClickFirstTab={()=>setActiveTab('first')}
        // SecondTabText="Raw Materials" onClickSecondTab={()=>setActiveTab('second')}
        // ThirdTabText="Production Materials" onClickThirdTab={()=>setActiveTab('third')}
        // FourthTabText="Output" onClickFourthTab={()=>setActiveTab('fourth')}
        // showSecondTab={true} showThirdTab={true} showFourthTab={true}
      />
        {
            activeTab === 'first' &&
            <ProdApprovalTable/>
        }
    </div>
  )
}

export default ApprovalComp