"use server";
import { IResponse } from '@/types/Types';
import { connectDB } from '../mongoose';
import { comparePassword, encryptPassword, respond, sendWelcomeEmail } from '../misc';
import User, { IUser } from '../models/user.model';
import { generatePassword } from '@/functions/helpers';
import Organization from '../models/org.model';


export async function createUser(data:Partial<IUser>):Promise<IResponse>{
    try {
        await connectDB();
        const user = await User.findOne({ email: data.email?.toLowerCase() });
        if (user) {
            return respond('User already exists', true, {}, 400);
        }
        const password = generatePassword(8);
        const hashedPassword = await encryptPassword(password);
        const userData:Partial<IUser> = {
            ...data, email:data?.email?.toLowerCase(), password: hashedPassword
        }
        const [newUser, org] = await Promise.all([
            User.create(userData),
            Organization.findById(data.org)
        ]);
        await sendWelcomeEmail({
            to: data.email!,
            companyName: 'Industra',
            companyInitials: 'Industra',
            userName: data.name!,
            userEmail: data.email!,
            password: password,
            appUrl: 'http://localhost:3000',
            supportEmail: org?.email || 'annan@consultntctech.com',
        });
        return respond('User created successfully', false, newUser, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating user', true, {}, 500);
    }
}

export async function getUsers():Promise<IResponse>{
    try {
        await connectDB();
        const users = await User.find();
        return respond('Users found successfully', false, users, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching users', true, {}, 500);
    }
}

export async function getUsersByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const users = await User.find({ org: orgId });
        return respond('Users found successfully', false, users, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching users', true, {}, 500);
    }
}


export async function updateUser(data:Partial<IUser>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedUser = await User.findByIdAndUpdate(data._id, data, { new: true });
        return respond('User updated successfully', false, updatedUser, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating user', true, {}, 500);
    }
}

export async function getUser(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const user = await User.findById(id);
        return respond("User retrieved successfully", false, user, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving user", true, {}, 500);
    }
}

export async function deleteUser(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedUser = await User.deleteOne({ _id: id });
        return respond('User deleted successfully', false, deletedUser, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting user', true, {}, 500);
    }
}

export async function changePassword(data:IUser):Promise<IResponse>{
    try {
        await connectDB();
        const hashedPassword = await encryptPassword(data.password);
        const updatedUser = await User.findByIdAndUpdate(data._id, {password:hashedPassword}, {new: true});
        const userData:Partial<IUser> = {
            ...updatedUser, password: ''
        }
        return respond('Password changed successfully', false, userData, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while changing password', true, {}, 500);
    }
}


export async function loginUser(data:Partial<IUser>):Promise<IResponse>{
    try {
        await connectDB();
        const user = await User.findOne({ email: data.email?.toLowerCase() })
        if (!user) {
            return respond('Invalid credentials', true, {}, 400);
        }
        const isMatch = await comparePassword(data.password!, user.password);
        if (!isMatch) {
            return respond('Invalid credentials', true, {}, 400);
        }
        const userData:Partial<IUser> = {
            ...user._doc, password: ''
        }
        return respond('Logged in successfully', false, userData, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while logging in user', true, {}, 500);
    }
}