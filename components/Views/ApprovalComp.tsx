'use client'
import  { useState } from 'react'
import CustomTabs from '../misc/CustomTabs'
import ProdApprovalTable from '../tables/approvals/ProdApprovalTable';
import PackApprovalTable from '../tables/packages/PackApprovalTable';

const ApprovalComp = () => {
    const [activeTab, setActiveTab] = useState<string>('first');
  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded" >
      <CustomTabs 
        FirstTabText="Production" activeTab={activeTab} onClickFirstTab={()=>setActiveTab('first')}
        SecondTabText="Packaging" onClickSecondTab={()=>setActiveTab('second')} showSecondTab
        // ThirdTabText="Production Materials" onClickThirdTab={()=>setActiveTab('third')}
        // FourthTabText="Output" onClickFourthTab={()=>setActiveTab('fourth')}
        // showSecondTab={true} showThirdTab={true} showFourthTab={true}
      />
        {
            activeTab === 'first' &&
            <ProdApprovalTable/>
        }
        {
            activeTab === 'second' &&
            <PackApprovalTable/>
        }
    </div>
  )
}

export default ApprovalComp