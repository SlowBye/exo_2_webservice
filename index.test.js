import request from "supertest";
import { describe, it, jest } from '@jest/globals';
import app from "./index.js";

describe("Get /users", () => {
    it("should return the list of users", async () => {
        const response = await request(app).get("/users");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, name: "dd" }]);
    });

    it("user should have id and name", async () => {
        const response = await request(app).get("/users");
        expect(response.body.every(user => 'id' in user && 'name' in user)).toBe(true);
    });

    
});

describe("Post /users", () => {
    it("should create a new user", async () => {
        const newUser = { id: 2, name: "newuser" };
        const response = await request(app).post("/users").send(newUser);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newUser);
    });

    it("should add the new user and see if there is 3 users", async () => {
        const newUser = { id: 3, name: "anotheruser" };
        await request(app).post("/users").send(newUser);
        const response = await request(app).get("/users");
        expect(response.body.length).toBe(3);
    });
});
