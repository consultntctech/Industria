'use server'

import { IResponse } from "@/types/Types";
import Employee, { IEmployee } from "../models/employee.model";
import { connectDB } from "../mongoose";
import { respond } from "../misc";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import User from "../models/user.model";
import '../models/department.model';
import '../models/org.model';


export async function checkEmployeeForUser(email:string):Promise<IResponse>{
    try {
        await connectDB();
        let empData;
        const [employee, user] = await Promise.all([
            Employee.findOne({ email: email.toLowerCase()?.trim() }),
            User.findOne({ email: email.toLowerCase()?.trim() }),
        ]);
        if(employee){
            return respond('Employee already exists', true, {}, 400);
        }
        if(user && !employee){
            empData = {
                name: user.name,
                email: user.email,
                org: user.org,
                department: user.department,
                userAccount: user._id,
                description: user.description,
                creator: user.creator,
                photo: user.photo,
                address: user.address,
                phone: user.phone,
            }
            return respond(`A user account already exists for the email ${email}. You can only import the user data into this record.`, true, empData, 422);
        }
        return respond('Employee found successfully', false, empData, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching employee', true, {}, 500);
    }
}



export async function createEmployee(data:Partial<IEmployee>):Promise<IResponse>{
    try {
        await connectDB();
        const emp = await Employee.findOne({ email: data.email?.toLowerCase()?.trim() });
        if(emp){
            return respond('Employee already exists', true, {}, 400);
        }
        const employee = await Employee.create({... data, email: data?.email?.toLowerCase()?.trim()});
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