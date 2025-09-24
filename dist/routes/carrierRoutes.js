"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const carrierController_1 = require("../controllers/carrierController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', carrierController_1.getCarriers);
router.get('/:id', carrierController_1.getCarrierById);
router.post('/', carrierController_1.createCarrier);
router.put('/:id', carrierController_1.updateCarrier);
router.delete('/:id', carrierController_1.deleteCarrier);
exports.default = router;
//# sourceMappingURL=carrierRoutes.js.map