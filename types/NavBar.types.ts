import { ReactNode } from "react";

export interface INavBarItem{
    id:string;
    title: string;
    icon:ReactNode;
    link?:string;
    isAdminOnly?:boolean;
    subMenu?:INavBarItem[];
}