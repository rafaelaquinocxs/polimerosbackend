"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const representativeController_1 = require("../controllers/representativeController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', representativeController_1.getRepresentatives);
router.get('/:id', representativeController_1.getRepresentativeById);
router.post('/', representativeController_1.createRepresentative);
router.put('/:id', representativeController_1.updateRepresentative);
router.delete('/:id', representativeController_1.deleteRepresentative);
exports.default = router;
//# sourceMappingURL=representativeRoutes.js.map