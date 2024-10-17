import { Router } from 'express'
const router = Router();

import {
    updateScan,
    updateKonsumsi
} from '../controllers/scanController.js';
import { checkFeatureEnabled } from '../middleware/featureSettingsMidddleware.js';
import { getMahasiswa } from '../controllers/mahasiswaController.js';
import { getOrangtua } from '../controllers/orangtuaController.js';
import MahasiswaModel from '../models/MahasiswaModel.js';
import { StatusCodes } from 'http-status-codes';
import OrangtuaModel from '../models/OrangtuaModel.js';


router.get('/:id', async (req, res) => {
    try {
        const mahasiswa = await MahasiswaModel.findById(req.params.id);

        if (mahasiswa) {
            return res.status(StatusCodes.OK).json({ message: "Mahasiswa", data: mahasiswa });
        }

        const orangtua = await OrangtuaModel.findById(req.params.id);
        if (orangtua) {
            return res.status(StatusCodes.OK).json({ message: "Orangtua", data: orangtua });
        }

        return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Mahasiswa atau Orangtua tidak ditemukan' });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
});

router.patch('/:id', checkFeatureEnabled(['Registrasi', 'Konsumsi']), (req, res, next) => {
  
        return updateScan(req, res, next);

    res.status(400).json({ msg: 'No feature enabled for this request.' });
});

export default router;
