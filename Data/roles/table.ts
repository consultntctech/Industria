import { ITable } from "@/types/Types";

export const TableData:ITable[] = [
    {
        id:'38',
        name:'Users',
        description:'Users table',
        level: 4
    },
    {
        id:'55',
        name: 'Batches',
        description: 'Batches table',
        level: 4
    },
    {
        id:'48',
        name: 'Configurations',
        description: 'Configure batches, currency and organization',
        level: 4
    },
    {
        id:'32',
        name:'Product Categories',
        description:'Product Categories table',
        level: 4
    },
    {
        id:'27',
        name:'Roles',
        description:'Roles table',
        level: 4
    },
    {
        id:'23',
        name: 'Roles Templates',
        description: 'Roles templates table',
        level: 4
    },
    {
        id:'41',
        name: 'Suppliers',
        description: 'Suppliers table',
        level: 4
    },
    {
        id:'28',
        name: 'Product Types',
        description: 'Product types table',
        level: 4
    },
    {
        id:'87',
        name: 'Raw Materials',
        description: 'Raw materials table',
        level: 4
    },
    {
        id:'8',
        name: 'Production',
        description: 'Production table',
        level: 5
    },
    {
        id:'88',
        name: 'Goods',
        description: 'Goods table',
        level: 4
    },
    {
        id:'33',
        name: 'Customers',
        description: 'Customers table',
        level: 4
    },
    {
        id:'12',
        name: 'Packaging Materials',
        description: 'Packaging materials table',
        level: 4
    },
    {
        id:'99',
        name: 'Packaging',
        description: 'Packaging table',
        level: 5
    },
    {
        id:'44',
        name: 'Line Item',
        description: 'Line Items table',
        level: 4
    },
    {
        id:'82',
        name: 'Sales',
        description: 'Sales table',
        level: 4
    },
    {
        id:'86',
        name: 'Orders',
        description: 'Orders table',
        level: 4
    },
    {
        id:'83',
        name: 'Returns',
        description: 'Returns table',
        level: 4
    },
    {
        id:'97',
        name: 'Finance',
        description: 'Finance information',
        level: 4
    },
    {
        id:'77',
        name: 'Storage',
        description: 'Storage table',
        level: 4
    },
    {
        id:'84',
        name: 'Alerts',
        description: 'Read Alerts',
        level: 4
    },
    {
        id:'91',
        name: 'Labourers',
        description: 'Labourers table',
        level: 4
    },
    {
        id: '92',
        name: 'Equipment Types',
        description: 'Equipment types table',
        level: 4
    },
    {
        id: '93',
        name: 'Equipment Categories',
        description: 'Equipment categories table',
        level: 4
    },
    {
        id: '94',
        name: 'Equipment Items',
        description: 'Equipment items table',
        level: 4
    },
    {
        id: '95',
        name: 'Departments',
        description: 'Departments table',
        level: 4
    },
    {
        id: '96',
        name: 'Employees',
        description: 'Employees table',
        level: 4
    }
    
].sort((a,b)=>a.name.localeCompare(b.name))