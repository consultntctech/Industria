'use client'
import { useState } from "react"
import CustomTabs from "../misc/CustomTabs";
import ProfileDetails from "../shared/outputs/profile/ProfileDetails";
import ProfileSecurity from "../shared/outputs/profile/ProfileSecurity";

const ProfileComp = () => {
    const [activeTab, setActiveTab] = useState<string>('first');
  return (
    <div className="flex gap-4 flex-col border border-gray-300 p-3 rounded">
        <CustomTabs 
            FirstTabText="Details" activeTab={activeTab} onClickFirstTab={()=>setActiveTab('first')}
            SecondTabText="Security" onClickSecondTab={()=>setActiveTab('second')} showSecondTab={true}
        />
        {
            activeTab === 'first' &&
            <ProfileDetails />
        }
        {
            activeTab === 'second' &&
            <ProfileSecurity/>
        }
    </div>
  )
}

export default ProfileComp