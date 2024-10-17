import { Router } from "express";
const router = Router();

import {
  getAllMahasiswas,
  getMahasiswa,
  createMahasiswa,
  updateMahasiswa,
  updateMahasiswaRegister,
  deleteMahasiswa,
  importDataMhs,
  exportPdfDataMhs,
  showStats,
} from "../controllers/mahasiswaController.js";
import upload from "../middleware/multerMiddleware.js";
import { authorizedPermissions } from "../middleware/authMiddleware.js";
import { checkFeatureEnabled } from "../middleware/featureSettingsMidddleware.js";
// import { validateJobInput, validateIdParam } from '../middleware/validationMiddleware.js';
// import { checkForTestUser } from '../middleware/authMiddleware.js';

router
  .route("/")
  .get(getAllMahasiswas)
  .post(authorizedPermissions("superadmin", "admin"), createMahasiswa);
router.route("/stats").get(showStats);
router.route("/export").get(exportPdfDataMhs);
router
  .route("/import")
  .post(
    authorizedPermissions("superadmin", "admin"),
    upload.single("file"),
    importDataMhs
  );

router
  .route("/:id")
  .all(authorizedPermissions("superadmin", "admin"))
  .get(getMahasiswa)
  .patch(updateMahasiswa)
  .delete(deleteMahasiswa);

router
  .route("/sudah/:id")
  .get(getMahasiswa)
  .patch(authorizedPermissions("superadmin", "admin"), checkFeatureEnabled(['Registrasi']), updateMahasiswaRegister);

export default router;
