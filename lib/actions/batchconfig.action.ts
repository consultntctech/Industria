'use server'

import { IResponse } from "@/types/Types";
import BatchConfig, { IBatchConfig } from "../models/batchconfig.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";

export async function createBatchConfig(data:Partial<IBatchConfig>):Promise<IResponse>{
    try {
        await connectDB();
        const config = await BatchConfig.findOne({ org: data.org });
        let opp;
        if(config){
           opp =  await BatchConfig.findByIdAndUpdate(config._id, data, { new: true });
        }else{
           opp  = await BatchConfig.create(data);
        }
        return respond('Batch-no configuration saved successfully', false, opp, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while saving batch-no configuration', true, {}, 500);
    }
}


export async function getBatchConfigsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const batchConfigs = await BatchConfig.find({
            $or: [
                { org: orgId },
                { mode: "Default" }
            ]
        });

        return respond('Batch-no configurations found successfully', false, batchConfigs, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching batch-no configurations', true, {}, 500);
    }
}

export async function getBatchConfForOrg(org:string):Promise<IResponse>{
    try {
        await connectDB();
        const batchConfig = await BatchConfig.findOne({ org });
        if(!batchConfig){
            const defaultConf = await BatchConfig.findOne({ mode: "Default" });
            return respond("Batch-no configuration retrieved successfully", false, defaultConf, 200);
        }else{
            return respond("Batch-no configuration retrieved successfully", false, batchConfig, 200);
        }
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving batch-no configuration", true, {}, 500);
    }
}

export async function getBatchConfigs():Promise<IResponse>{
    try {
        await connectDB();
        const batchConfigs = await BatchConfig.find();
        return respond('Batch-no configurations found successfully', false, batchConfigs, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching batch-no configurations', true, {}, 500);
    }
}

export async function getBatchConfigById(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const batchConfig = await BatchConfig.findById(id);
        return respond("Batch-no configuration retrieved successfully", false, batchConfig, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving batch-no configuration", true, {}, 500);
    }
}

export async function updateBatchConfig(data:Partial<IBatchConfig>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedBatchConfig = await BatchConfig.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Batch-no configuration saved successfully', false, updatedBatchConfig, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while saving batch-no configuration', true, {}, 500);
    }
}

export async function deleteBatchConfig(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedBatchConfig = await BatchConfig.deleteOne({ _id: id });
        return respond('Batch-no configuration deleted successfully', false, deletedBatchConfig, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting batch-no configuration', true, {}, 500);
    }
}