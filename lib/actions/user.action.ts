"use server";
import { IResponse } from '@/types/Types';
import '../models/org.model'
import { connectDB } from '../mongoose';
import { encryptPassword, respond, sendWelcomeEmail } from '../misc';
import User, { IUser } from '../models/user.model';
import { generatePassword } from '@/functions/helpers';


export async function createUser(data:Partial<IUser>):Promise<IResponse>{
    try {
        await connectDB();
        const user = await User.findOne({ email: data.email });
        if (user) {
            return respond('User already exists', true, {}, 400);
        }
        const password = generatePassword(8);
        const hashedPassword = await encryptPassword(password);
        const userData:Partial<IUser> = {
            ...data, password: hashedPassword
        }
        const newUser = await User.create(userData);
        await sendWelcomeEmail({
            to: data.email!,
            companyName: 'Industra',
            companyInitials: 'Industra',
            userName: data.email!,
            password: password,
            appUrl: 'http://localhost:3000',
            supportEmail: 'annan@consultntctech.com',
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