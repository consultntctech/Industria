import { INavBarItem } from "@/types/NavBar.types";
import { BsCartPlus } from "react-icons/bs";
import { CiBag1, CiCircleCheck } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { GoPeople } from "react-icons/go";
import { GrAlert, GrShieldSecurity } from "react-icons/gr";
import { HiOutlineCash, HiOutlineCurrencyDollar, HiOutlineUsers } from "react-icons/hi";
import { IoAlertCircleOutline, IoSettingsOutline } from "react-icons/io5";
import { LiaRecycleSolid, LiaShoppingBasketSolid, LiaUsersCogSolid } from "react-icons/lia";
import { LuBaggageClaim, LuGitPullRequest, LuLayoutDashboard, LuPillBottle, LuShoppingCart } from "react-icons/lu";
import { MdOutlineCategory, MdOutlineStoreMallDirectory, /*MdStackedLineChart*/ } from "react-icons/md";
import { PiCashRegisterLight, PiUsersThree } from "react-icons/pi";
import { RiShieldFlashLine, RiStackLine, RiStackshareLine } from "react-icons/ri";
import { RxStack } from "react-icons/rx";
import { SiAwsorganizations } from "react-icons/si";
import { TbCashOff,  TbDashboard,  TbTimeline } from "react-icons/tb";
import { TfiPackage } from "react-icons/tfi";

export const NavLinks = (): INavBarItem[] => {
  return [
    
    {
      id: "1",
      title: "Dashboard",
      icon: <LuLayoutDashboard />,
      link: "/dashboard",
      tableids: ['97']
    },
    {
      id: "2",
      title: "Users and Roles",
      icon: <PiUsersThree />,
      tableids: ['38', '27', '23'],
      subMenu: [
        { id: "21", tableids:['38'], title: "Users", icon: <LiaUsersCogSolid />, link: "/dashboard/users" },
        { id: "22", tableids:['27'], title: "Roles", icon: <GrShieldSecurity />, link: "/dashboard/roles" },
        { id: "23", tableids:['23'], title: "Role Templates", icon: <RiShieldFlashLine />, link: "/dashboard/templates" },
      ],
    },
    {
      id: "11",
      title: "Suppliers",
      tableids: ['41'],
      icon: <GoPeople />,
      link: "/dashboard/suppliers",
    },
    {
      id: "3",
      title: "Products",
      icon: <LuShoppingCart />,
      tableids: ['28', '32', '55', '87'],
      subMenu: [
        {id: '30', tableids:['28', '32', '55', '87'], title:'Dashboard', icon: <TbDashboard />, link: '/dashboard/products/dashboard'},
        { id: "33", tableids:['32'], title: "Categories", icon: <MdOutlineCategory />, link: "/dashboard/products/categories" },
        { id: "31", tableids:['55'], title: "Batches", icon: <RxStack />, link: "/dashboard/products/batches" },
        { id: "32", tableids:['28'], title: "Types", icon: <BsCartPlus />, link: "/dashboard/products/types" },
        { id: "34", tableids:['87'], title: "Raw Materials", icon: <LiaShoppingBasketSolid />, link: "/dashboard/products/raw-materials" },
      ],
    },
    {
      id: "4",
      title: "Processing",
      icon: <LiaRecycleSolid />,
      tableids: ['8', '88'],
      subMenu: [
        {id: '40', tableids: ['8', '88'], title:'Dashboard', icon: <TbDashboard />, link: '/dashboard/processing/dashboard'},
        { id: "41", tableids:['8'], title: "Production", icon: <FiRefreshCw />, link: "/dashboard/processing/production" },
        { id: "42", tableids:['88'], title: "Goods", icon: <CiBag1 />, link: "/dashboard/processing/goods" },
      ],
    },
    {
      id: "5",
      title: "Distribution",
      icon: <LuBaggageClaim />,
      tableids: ['33', '12', '99'],
      subMenu: [
        {id: '50', tableids: ['33', '12', '99'], title:'Dashboard', icon: <TbDashboard />, link: '/dashboard/distribution/dashboard'},
        { id: "51", tableids: ['33'], title: "Customers", icon: <HiOutlineUsers />, link: "/dashboard/distribution/customers" },
        { id: "52", tableids: ['12'], title: "Packaging Items", icon: <LuPillBottle />, link: "/dashboard/distribution/packaging-materials" },
        { id: "53", tableids: ['99'], title: "Packaging", icon: <TfiPackage />, link: "/dashboard/distribution/packaging" },
      ],
    },
    {
      id: "6",
      title: "Transactions",
      icon: <HiOutlineCash />,
      tableids: ['82', '86', '83', '97'],
      subMenu: [
        {id: '60', tableids: ['82', '86', '83', '97'], title:'Dashboard', icon: <TbDashboard />, link: '/dashboard/transactions/dashboard'},
        { id: "61", tableids: ['82'], title: "Sales", icon: <PiCashRegisterLight />, link: "/dashboard/transactions/sales" },
        { id: "62", tableids: ['86'], title: "Orders", icon: <LuGitPullRequest />, link: "/dashboard/transactions/orders" },
        { id: "63", tableids: ['83'], title: "Returns", icon: <TbCashOff />, link: "/dashboard/transactions/returns" },
        { id: "64", tableids: ['97'], title: "Finance", icon: <TbTimeline />, link: "/dashboard/transactions/finance" },
      ],
    },
    {
      id: "7",
      title: "Storage",
      icon: <MdOutlineStoreMallDirectory />,
      link: "/dashboard/storage",
      tableids: ['77']
    },
    {
      id: "12",
      title: "Alerts & Approvals",
      tableids: ['84', '28', '87', '8', '88', '12', '99'],
      icon: <IoAlertCircleOutline />,
      subMenu: [
        { id: "121", tableids: ['84'], title: "Alerts", icon: <GrAlert />, link: "/dashboard/alerts" },
        { id: "122", tableids: ['28', '87', '8', '88', '12', '99'], title: "Approvals", icon: <CiCircleCheck />, link: "/dashboard/approvals" },
      ],
    },
    // {
    //   id: "8",
    //   title: "Reports",
    //   icon: <MdStackedLineChart />,
    //   link: "/dashboard/reports",
    // },
    {
      id: "10",
      title: "Configurations",
      icon: <IoSettingsOutline />,
      tableids: ['0', '48'],
      subMenu: [
        { id: "101", tableids:['48'], title: "Batch No.", icon: <RiStackLine />, link: "/dashboard/config/batch-no" },
        // { id: "102", title: "Serial No.", icon: <TbLine />, link: "/dashboard/config/serial-no" },
        { id: "103", tableids:['48'], title: "Org Settings", icon: <RiStackshareLine />, link: "/dashboard/config/org-settings" },
        { id: "104", tableids:['48'], title: "Currency", icon: <HiOutlineCurrencyDollar />, link: "/dashboard/config/currency" },
        { id: "105", tableids:['0'], title: "User Account", icon: <FaRegUser />, link: "/dashboard/config/profile" },
      ],
    },

    {
        id: "13",
        title: 'Organizations',
        icon: <SiAwsorganizations/>,
        link: '/dashboard/organizations',
        tableids: ['100']
    },
  ];
};
