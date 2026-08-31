import { Types } from 'mongoose';

export type EquipmentStatus = 'Available' | 'In Use' | 'Maintenance';
export type EquipmentStatsGroup = 'category' | 'type';

export interface IEquipmentMonthly {
  month: string;
  count: number;
  price: number;
}

export interface IMonthlyStatusCount {
  Available: IEquipmentMonthly[];
  'In Use': IEquipmentMonthly[];
  Maintenance: IEquipmentMonthly[];
}

export interface IStatusCount {
  count: number;
  price: number;
}

export interface IAllTimeStatusCount {
  Available: IStatusCount;
  'In Use': IStatusCount;
  Maintenance: IStatusCount;
}

export interface IGroupedEquipmentCount {
  id: string;
  name: string;
  count: number;
  price: number;
}

export interface IEquipmentStatsPayload {
  monthly: IMonthlyStatusCount;
  groupedByCategory: IGroupedEquipmentCount[];
  groupedByType: IGroupedEquipmentCount[];
  allTime: IAllTimeStatusCount;
}

export interface IMonthlyAggregateResult {
  _id: {
    year: number;
    month: number;
    status: EquipmentStatus;
  };
  count: number;
  price: number;
}

export interface IGroupedEquipmentAggregateResult {
  id: Types.ObjectId;
  name: string;
  count: number;
  price: number;
}

export interface IAllTimeAggregateResult {
  _id: EquipmentStatus;
  count: number;
  price: number;
}