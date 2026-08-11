export interface ICostStats {
    production:{
        pCost:IMonthlyCost[];
        labourCost:IMonthlyCost[];
        extraCost:IMonthlyCost[];
    },
    packages:IMonthlyCost[],
    rawMaterials:IMonthlyCost[],
    prodItems: IMonthlyCost[],
}

export interface IMonthlyCost {
    month: string;
    cost: number;
}