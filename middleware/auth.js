import express from 'express';
import jwt from "jsonwebtoken";

const JWT_SECRET = "inspi_max";

const token_auth = (req, res, next)=>{
    const token = req.headers.authorization;

    if (!token) {
        res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized" });
    }
}

export default token_auth;