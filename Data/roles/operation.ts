import { IOperation } from "@/types/Types";

export const OperationData:IOperation[] = [
    {
        id: '1',
        name:'READ',
        title:'Reader',
        description:'Can read data in a collection'
    },
    {
        id: '2',
        name: 'CREATE',
        title: 'Creator',
        description: 'Can create new data in a collection'
    },
    
    {
        id: '3',
        name: 'UPDATE',
        title: 'Updater',
        description: 'Can update data in a collection'
    },
    {
        id: '4',
        name: 'DELETE',
        title: 'Deleter',
        description: 'Can delete data in a collection'
    },
    {
        id: '5',
        name: 'APPROVE',
        title: 'Approver',
        description: 'Can approve data in a collection'
    }

]