"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var waste_controller_1 = require("../controllers/waste.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
router.post('/', auth_middleware_1.protect, waste_controller_1.createWaste);
router.get('/', waste_controller_1.getAllWastes);
router.get('/categories', waste_controller_1.getCategories);
exports.default = router;
//# sourceMappingURL=waste.routes.js.map