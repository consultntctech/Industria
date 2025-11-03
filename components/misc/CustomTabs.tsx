import { useSettings } from "@/config/useSettings";

type CustomTabsProps = {
    FirstTabText: string;
    onClickFirstTab: () => void;
    SecondTabText?: string;
    onClickSecondTab?: () => void;
    showSecondTab?: boolean;
    ThirdTabText?: string;
    onClickThirdTab?: () => void;
    showThirdTab?: boolean;
    FourthTabText?: string;
    onClickFourthTab?: () => void;
    showFourthTab?: boolean;
    activeTab: string;
}

const CustomTabs = ({FirstTabText, onClickFirstTab,  SecondTabText, onClickSecondTab,  showSecondTab, ThirdTabText, onClickThirdTab,  showThirdTab, FourthTabText, onClickFourthTab, showFourthTab, activeTab}:CustomTabsProps) => {
    const {secondaryColour} = useSettings();
  return (
    <div className="flex flex-row shadow rounded border-[0.5px] border-slate-200 p-1 w-fit" >
        <span style={{borderBottomColor: activeTab === 'first' ? secondaryColour : ''}}  className={`px-2 pb-0.5  cursor-pointer ${activeTab === 'first' ? 'smallText  border-b' : 'greyText'}`} onClick={onClickFirstTab}>{FirstTabText}</span>
        {
            showSecondTab &&
            <span style={{borderBottomColor: activeTab === 'second' ? secondaryColour : ''}} className={`px-2 pb-0.5 cursor-pointer ${activeTab === 'second' ? 'smallText  border-b' : 'greyText'}`} onClick={onClickSecondTab}>{SecondTabText}</span>
        }
        {
            showThirdTab &&
            <span style={{borderBottomColor: activeTab === 'third' ? secondaryColour : ''}} className={`px-2 pb-0.5 cursor-pointer ${activeTab === 'third' ? 'smallText  border-b' : 'greyText'}`} onClick={onClickThirdTab}>{ThirdTabText}</span>
        }
        {
            showFourthTab &&
            <span style={{borderBottomColor: activeTab === 'fourth' ? secondaryColour : ''}} className={`px-2 pb-0.5 cursor-pointer ${activeTab === 'fourth' ? 'smallText  border-b' : 'greyText'}`} onClick={onClickFourthTab}>{FourthTabText}</span>
        }
    </div>
  )
}

export default CustomTabs