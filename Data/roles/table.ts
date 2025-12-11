import { ITable } from "@/types/Types";

export const TableData:ITable[] = [
    {
        id:'38',
        name:'Users',
        description:'Users table'
    },
    {
        id:'55',
        name: 'Batches',
        description: 'Batches table'
    },
    {
        id:'48',
        name: 'Configurations',
        description: 'Configure batches, currency and organization'
    },
    {
        id:'32',
        name:'Categories',
        description:'Categories table'
    },
    {
        id:'27',
        name:'Roles',
        description:'Roles table'
    },
    {
        id:'23',
        name: 'Roles Templates',
        description: 'Roles templates table'
    },
    {
        id:'41',
        name: 'Suppliers',
        description: 'Suppliers table'
    },
    {
        id:'28',
        name: 'Product Types',
        description: 'Product types table'
    },
    {
        id:'87',
        name: 'Raw Materials',
        description: 'Raw materials table'
    },
    {
        id:'8',
        name: 'Production',
        description: 'Production table'
    },
    {
        id:'87',
        name: 'Goods',
        description: 'Goods table'
    },
    {
        id:'33',
        name: 'Customers',
        description: 'Customers table'
    },
    {
        id:'12',
        name: 'Packaging Materials',
        description: 'Packaging materials table'
    },
    {
        id:'99',
        name: 'Packaging',
        description: 'Packaging table'
    },
    {
        id:'82',
        name: 'Sales',
        description: 'Sales table'
    },
    {
        id:'86',
        name: 'Orders',
        description: 'Orders table'
    },
    {
        id:'83',
        name: 'Returns',
        description: 'Returns table'
    },
    {
        id:'97',
        name: 'Finance',
        description: 'Finance information'
    },
    {
        id:'77',
        name: 'Storage',
        description: 'Storage table'
    },
    {
        id:'84',
        name: 'Alerts',
        description: 'Read Alerts'
    },
].sort((a,b)=>a.name.localeCompare(b.name))