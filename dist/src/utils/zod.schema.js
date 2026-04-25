"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wasteSchema = exports.loginSchema = exports.registerSchema = void 0;
var client_1 = require("@prisma/client");
var zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.nativeEnum(client_1.Role),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
// Updated schema to match prisma/schema.prisma
exports.wasteSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    weight: zod_1.z.number().positive("Weight must be a positive number"),
    categoryId: zod_1.z.string().uuid("Invalid category ID"),
    imageUrl: zod_1.z.string().url("Invalid URL format").optional(),
});
//# sourceMappingURL=zod.schema.js.map