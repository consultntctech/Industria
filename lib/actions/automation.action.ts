'use server'

import { connectDB } from "../mongoose";
import OtherCurrency from "../models/othercurrency.model";
import { respond } from "../misc";
import Currency from "../models/currency.model";
import User from "../models/user.model";
import Employee from "../models/employee.model";
import Product from "../models/product.model";
import Category from "../models/category.model";

export async function updateCurrencies(){
    try {
        await connectDB();
        await OtherCurrency.updateMany({}, {type:'other'});
        return respond('Currencies updated successfully', false, {}, 200);
    } catch (error) {
        console.log(error);
    }
}


export async function createDefaultOtherCurrency(){
    try {
        await connectDB();
        const currencies = await Currency.find();
        await  Promise.all(currencies.map((currency)=>
        OtherCurrency.create({
            name: currency.name,
            symbol: currency.symbol,
            rate: 1,
            type: 'default',
            note: '',
            creator: currency.creator,
            org: currency.org,
            createdBy: currency.createdBy,
        })
        ))
        return respond('Currencies created successfully', false, {}, 200);
    } catch (error) {
        console.log(error)
    }
}


export async function saveUsersAsEmployees(){
    try {
        await connectDB();
        const users = await User.find();
        await Promise.all(users.map((user)=>
        Employee.create({
            _id: user._id,
            name: user.name,
            address: user.address,
            phone: user.phone,
            email: user.email,
            photo: user.photo,
            department: user.department,
            userAccount: user._id,
            description: user.description,
            creator: user.creator,
            org: user.org,
        })
        ))
        return respond('Users saved as employees successfully', false, {}, 200);
    } catch (error) {
        console.log(error)
    }
}


export async function deleteAllEmployees(){
    try {
        await connectDB();
        const employees = await Employee.find();
        await Promise.all(employees.map((emp)=>Employee.deleteOne({_id:emp._id})));
        return respond('All employees deleted successfully', false, {}, 200);
    } catch (error) {
        console.log(error)
    }
}


export async function updateAllProductWithLowerCaseName(){
    try {
        await connectDB();
        const products = await Product.find();
        await Promise.all(products.map((product)=>Product.updateOne({_id:product._id}, {lowerName: product.name?.trim()?.toLowerCase()})));
        return respond('All products updated successfully', false, {}, 200);
    } catch (error) {
        console.log(error)
    }
}


export async function updateAllCategoryWithLowerCaseName(){
    try {
        await connectDB();
        const categories = await Category.find();
        await Promise.all(categories.map((category)=>Category.updateOne({_id:category._id}, {lowerName: category.name?.trim()?.toLowerCase()})));
        return respond('All categories updated successfully', false, {}, 200);
    } catch (error) {
        console.log(error)
    }
}