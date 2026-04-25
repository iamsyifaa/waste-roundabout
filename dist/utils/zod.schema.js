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
exports.wasteSchema = zod_1.z.object({
    category_id: zod_1.z.string(),
    weight_kg: zod_1.z.number().positive(),
    lat: zod_1.z.number(),
    long: zod_1.z.number(),
});
//# sourceMappingURL=zod.schema.js.map