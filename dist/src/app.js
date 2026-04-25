"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var morgan_1 = __importDefault(require("morgan"));
var auth_routes_1 = __importDefault(require("./routes/auth.routes"));
var waste_routes_1 = __importDefault(require("./routes/waste.routes"));
var transaction_routes_1 = __importDefault(require("./routes/transaction.routes")); // Import transaction routes
var app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Define a consistent API version prefix
var API_PREFIX = '/api/v1';
app.use("".concat(API_PREFIX, "/auth"), auth_routes_1.default);
app.use("".concat(API_PREFIX, "/waste"), waste_routes_1.default);
app.use("".concat(API_PREFIX, "/transactions"), transaction_routes_1.default); // Add transaction routes
app.get('/ping', function (_req, res) {
    res.send('pong');
});
exports.default = app;
//# sourceMappingURL=app.js.map