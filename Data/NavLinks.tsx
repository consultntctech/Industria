import { INavBarItem } from "@/types/NavBar.types";
import { BsCartPlus } from "react-icons/bs";
import { CiBag1, CiCircleCheck } from "react-icons/ci";
import { FiRefreshCw } from "react-icons/fi";
import { GoPeople } from "react-icons/go";
import { GrAlert, GrShieldSecurity } from "react-icons/gr";
import { HiOutlineCash, HiOutlineCurrencyDollar, HiOutlineUsers } from "react-icons/hi";
import { IoAlertCircleOutline, IoSettingsOutline } from "react-icons/io5";
import { LiaRecycleSolid, LiaShoppingBasketSolid, LiaUsersCogSolid } from "react-icons/lia";
import { LuBaggageClaim, LuGitPullRequest, LuLayoutDashboard, LuPillBottle, LuShoppingCart } from "react-icons/lu";
import { MdOutlineCategory, MdOutlineStoreMallDirectory, MdStackedLineChart } from "react-icons/md";
import { PiCashRegisterLight, PiUsersThree } from "react-icons/pi";
import { RiShieldFlashLine, RiStackLine, RiStackshareLine } from "react-icons/ri";
import { RxStack } from "react-icons/rx";
import { SiAwsorganizations } from "react-icons/si";
import { TbCashOff, TbLine, TbTimeline } from "react-icons/tb";
import { TfiPackage } from "react-icons/tfi";

export const NavLinks = (): INavBarItem[] => {
  return [
    
    {
      id: "1",
      title: "Dashboard",
      icon: <LuLayoutDashboard />,
      link: "/dashboard/dashboard",
    },
    {
      id: "2",
      title: "Users and Roles",
      icon: <PiUsersThree />,
      subMenu: [
        { id: "21", title: "Users", icon: <LiaUsersCogSolid />, link: "/dashboard/users" },
        { id: "22", title: "Roles", icon: <GrShieldSecurity />, link: "/dashboard/users/roles" },
        { id: "23", title: "Role Templates", icon: <RiShieldFlashLine />, link: "/dashboard/users/templates" },
      ],
    },
    {
      id: "11",
      title: "Suppliers",
      icon: <GoPeople />,
      link: "/dashboard/suppliers",
    },
    {
      id: "3",
      title: "Products",
      icon: <LuShoppingCart />,
      subMenu: [
        { id: "33", title: "Categories", icon: <MdOutlineCategory />, link: "/dashboard/products/categories" },
        { id: "31", title: "Batches", icon: <RxStack />, link: "/dashboard/products/batches" },
        { id: "32", title: "Types", icon: <BsCartPlus />, link: "/dashboard/products/types" },
        { id: "34", title: "Raw Materials", icon: <LiaShoppingBasketSolid />, link: "/dashboard/products/raw-materials" },
      ],
    },
    {
      id: "4",
      title: "Processing",
      icon: <LiaRecycleSolid />,
      subMenu: [
        { id: "43", title: "Production Items", icon: <LuPillBottle />, link: "/dashboard/processing/production-materials" },
        { id: "41", title: "Production", icon: <FiRefreshCw />, link: "/dashboard/processing/production" },
        { id: "42", title: "Goods", icon: <CiBag1 />, link: "/dashboard/processing/goods" },
      ],
    },
    {
      id: "5",
      title: "Distribution",
      icon: <LuBaggageClaim />,
      subMenu: [
        { id: "51", title: "Customers", icon: <HiOutlineUsers />, link: "/dashboard/distribution/customers" },
        { id: "52", title: "Packaging", icon: <TfiPackage />, link: "/dashboard/distribution/packaging" },
      ],
    },
    {
      id: "6",
      title: "Transactions",
      icon: <HiOutlineCash />,
      subMenu: [
        { id: "61", title: "Sales", icon: <PiCashRegisterLight />, link: "/dashboard/transactions/sales" },
        { id: "62", title: "Orders", icon: <LuGitPullRequest />, link: "/dashboard/transactions/orders" },
        { id: "63", title: "Refunds", icon: <TbCashOff />, link: "/dashboard/transactions/refunds" },
        { id: "64", title: "Finance", icon: <TbTimeline />, link: "/dashboard/transactions/finance" },
      ],
    },
    {
      id: "7",
      title: "Storage",
      icon: <MdOutlineStoreMallDirectory />,
      link: "/dashboard/storage",
    },
    {
      id: "12",
      title: "Alerts & Approvals",
      icon: <IoAlertCircleOutline />,
      subMenu: [
        { id: "121", title: "Alerts", icon: <GrAlert />, link: "/dashboard/alerts" },
        { id: "122", title: "Approvals", icon: <CiCircleCheck />, link: "/dashboard/approvals" },
      ],
    },
    {
      id: "8",
      title: "Reports",
      icon: <MdStackedLineChart />,
      link: "/dashboard/reports",
    },
    {
      id: "10",
      title: "Configurations",
      icon: <IoSettingsOutline />,
      subMenu: [
        { id: "101", title: "Batch No.", icon: <RiStackLine />, link: "/dashboard/config/batch-no" },
        { id: "102", title: "Serial No.", icon: <TbLine />, link: "/dashboard/config/serial-no" },
        { id: "103", title: "Org Settings", icon: <RiStackshareLine />, link: "/dashboard/config/org-settings" },
        { id: "104", title: "Currency", icon: <HiOutlineCurrencyDollar />, link: "/dashboard/config/currency" },
      ],
    },

    {
        id: "13",
        title: 'Organizations',
        icon: <SiAwsorganizations/>,
        link: '/dashboard/organizations'
    },
  ];
};
