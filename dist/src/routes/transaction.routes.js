"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var transaction_controller_1 = require("../controllers/transaction.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
// All transaction routes are protected
router.use(auth_middleware_1.protect);
// Route for a buyer (collector) to create a transaction
router.post('/', transaction_controller_1.createTransaction);
// Route for a buyer (collector) or admin to mark a transaction as complete
router.patch('/:id/complete', transaction_controller_1.completeTransaction);
exports.default = router;
//# sourceMappingURL=transaction.routes.js.map