"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.getAllWastes = exports.createWaste = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var createWaste = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, description, weight, categoryId, imageUrl, newPost, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!req.user || req.user.role !== client_1.Role.FARMER) {
                    return [2 /*return*/, res.status(403).json({ message: 'Hanya Farmer yang bisa posting limbah.' })];
                }
                _a = req.body, title = _a.title, description = _a.description, weight = _a.weight, categoryId = _a.categoryId, imageUrl = _a.imageUrl;
                if (weight <= 0) {
                    return [2 /*return*/, res.status(400).json({ message: 'Berat limbah harus lebih dari 0 kg.' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.wastePost.create({
                        data: {
                            title: title,
                            description: description,
                            weight: weight,
                            imageUrl: imageUrl,
                            categoryId: categoryId,
                            postedById: req.user.id,
                            status: client_1.WastePostStatus.AVAILABLE,
                        },
                    })];
            case 2:
                newPost = _b.sent();
                res.status(201).json(newPost);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                res.status(500).json({ message: 'Gagal membuat postingan limbah.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.createWaste = createWaste;
var getAllWastes = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, categoryId, lat, long, where, wastes, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, categoryId = _a.categoryId, lat = _a.lat, long = _a.long;
                where = {
                    status: client_1.WastePostStatus.AVAILABLE,
                };
                if (categoryId) {
                    where.categoryId = categoryId;
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.wastePost.findMany({
                        where: where,
                        include: { category: true, postedBy: { select: { name: true, email: true } } },
                    })];
            case 2:
                wastes = _b.sent();
                res.status(200).json(wastes);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                res.status(500).json({ message: 'Gagal mengambil data.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getAllWastes = getAllWastes;
var getCategories = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var categories, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.wasteCategory.findMany()];
            case 1:
                categories = _a.sent();
                res.status(200).json(categories);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(500).json({ message: 'Gagal mengambil kategori.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getCategories = getCategories;
//# sourceMappingURL=waste.controller.js.map