"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/dashboard/stats', orderController_1.getDashboardStats);
router.get('/', orderController_1.getOrders);
router.get('/:id', orderController_1.getOrderById);
router.post('/', orderController_1.createOrder);
router.put('/:id', orderController_1.updateOrder);
router.delete('/:id', orderController_1.deleteOrder);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map