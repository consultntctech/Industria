'use server'

import { IResponse } from "@/types/Types";
import Employee, { IEmployee } from "../models/employee.model";
import { connectDB } from "../mongoose";
import { respond } from "../misc";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import User from "../models/user.model";
import '../models/department.model';
import '../models/org.model';


export async function createEmployee(data:Partial<IEmployee>):Promise<IResponse>{
    try {
        await connectDB();
        const employee = await Employee.create(data);
        return respond('Employee created successfully', false, employee, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating employee', true, {}, 500);
    }
}

export async function getEmployees():Promise<IResponse>{
    try {
        await connectDB();
        const employees = await Employee.find()
        .populate('userAccount')
        .populate('org')
        .populate('department');
        return respond('Employees found successfully', false, employees, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching employees', true, {}, 500);
    }
}

export async function getEmployeeByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const employees = await Employee.find({ org: orgId })
        .populate('userAccount')
        .populate('org')
        .populate('department');
        return respond('Employees found successfully', false, employees, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching employees', true, {}, 500);
    }
}


export async function employeeHasAccount(email:string):Promise<IResponse>{
    try {
        await connectDB();
        const employee = await User.findOne({ email: email.toLowerCase() });
        return respond('Employee found successfully', false, employee, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching employee', true, {}, 500);
    }
}


export async function getEmployeesByDepartment(departmentId:string):Promise<IResponse>{
    try {
        await connectDB();
        const employees = await Employee.find({ department: departmentId })
        .populate('userAccount')
        .populate('org')
        .populate('department');;
        return respond('Employees found successfully', false, employees, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching employees', true, {}, 500);
    }
}


export async function updateEmployee(data:Partial<IEmployee>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedEmployee = await Employee.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Employee updated successfully', false, updatedEmployee, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating employee', true, {}, 500);
    }
}

export async function getEmployee(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(Employee, id, "Employee", [{ path: "org" }, { path: "department" }, { path: "userAccount" }]);

    // If not allowed, return the middleware's response directly
    if ("allowed" in check === false) return check;

    // Authorized → you can use check.doc safely, fully typed as Employee
    const employee = check.doc;

    return respond("Employee retrieved successfully", false, employee, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred retrieving employee", true, {}, 500);
  }
}

export async function deleteEmployee(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedEmployee = await Employee.deleteOne({ _id: id });
        return respond('Employee deleted successfully', false, deletedEmployee, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting employee', true, {}, 500);
    }
}