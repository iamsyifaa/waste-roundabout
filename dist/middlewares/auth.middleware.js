"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var protect = function (req, res, next) {
    var _a, _b;
    var token = (_b = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')) === null || _b === void 0 ? void 0 : _b[1];
    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }
    try {
        var decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};
exports.protect = protect;
//# sourceMappingURL=auth.middleware.js.map