import user from "../db/models/user.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


export const signup = async (req, res) => {

    try {
        let { name, email, password } = req.body;

        if (!name || !email || !password) {
            let response = errorResponse({
                statusCode: 400,
                message: "All fields are required"
            })
            return res.status(response.statusCode).send(response);

        }

        password = await bcrypt.hash(password, 10);

        const newUser = new user({
            name,
            email,
            password
        });
        await newUser.save();

        let response = successResponse({
            statusCode: 201,
            message: "Signup successful",
            data: newUser
        });
        return res.status(response.statusCode).send(response);
    } catch (error) {
        let response = errorResponse({
            statusCode: 500,
            message: error.message
        })
        return res.status(response.statusCode).send(response);
    }

}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            let response = errorResponse({
                statusCode: 400,
                message: "All fields are required"
            })
            return response;
        }

        const existingUser = await user.findOne({ email });
        if (!existingUser) {
            let response = errorResponse({
                statusCode: 404,
                message: "User not found"
            })
            return res.status(response.statusCode).send(response);

        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            let response = errorResponse({
                statusCode: 401,
                message: "Invalid password"
            })
            return res.status(response.statusCode).send(response);
        }


        // Generate JWT token
        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        let response = successResponse({
            statusCode: 200,
            message: "Login successful",
            data: { user: existingUser, token }
        })
        return res.status(response.statusCode).send(response);

    } catch (error) {
        let response = errorResponse({
            statusCode: 500,
            message: error.message ? error.message : "Something went wrong"
        })
        return res.status(response.statusCode).send(response);
    }

}