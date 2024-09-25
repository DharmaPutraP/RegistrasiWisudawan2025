import { Router } from "express";

const router = Router();

import {
  getAllOrangtua,
  getOrangtua,
  createOrangtua,
  updateOrangtua,
  deleteOrangtua,
  importDataOrtu,
  exportPdfDataOrtu,
  updateOrangtuaRegister,
  updateOrangtuaKonsumsi,
  showStats,
} from "../controllers/orangtuaController.js";
import upload from "../middleware/multerMiddleware.js";
import { authorizedPermissions } from "../middleware/authMiddleware.js";
// import { validateJobInput, validateIdParam } from '../middleware/validationMiddleware.js';
// import { checkForTestUser } from '../middleware/authMiddleware.js';

router
  .route("/")
  .get(getAllOrangtua)
  .post(authorizedPermissions("superadmin", "admin"), createOrangtua);
router.route("/stats").get(showStats);
router.route("/export").get(exportPdfDataOrtu);
router
  .route("/import")
  .post(
    authorizedPermissions("superadmin", "admin"),
    upload.single("file"),
    importDataOrtu
  );
router
  .route("/:id")
  .all(authorizedPermissions("superadmin", "admin"))
  .get(getOrangtua)
  .patch(updateOrangtua)
  .delete(deleteOrangtua);

router
  .route("/sudah/:id")
  .get(getOrangtua)
  .patch(authorizedPermissions("superadmin", "admin"), updateOrangtuaRegister);

router
  .route("/konsumsi/:id")
  .patch(authorizedPermissions("superadmin", "admin"), updateOrangtuaKonsumsi);

export default router;
