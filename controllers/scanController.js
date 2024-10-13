import Mahasiswa from '../models/MahasiswaModel.js';
import Orangtua from "../models/OrangtuaModel.js";
import { StatusCodes } from "http-status-codes";
import { triggerPusher } from '../utils/triggerPusher.js';
import MejaRegistrasiModel from '../models/MejaRegistrasiModel.js';
import { get } from 'https';
import mongoose, { set } from 'mongoose';

export const updateScan = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let isRegis = true;
        let updatedData;
        let message;

        const updatedMahasiswa = await Mahasiswa.findByIdAndUpdate(req.params.id, { isRegis: isRegis, isRegisBy: req.user.userId }, {
            new: true,
        });

        if (updatedMahasiswa) {
            updatedData = updatedMahasiswa;
            message = 'Mahasiswa';
        } else {
            const getPintu = await MejaRegistrasiModel.findById(req.body.mejaId);

            if (!getPintu) {
                return res.status(404).send('Meja tidak ditemukan.');
            }

            const orangtua = await Orangtua.findById(req.params.id);

            if (!orangtua) {
                return res.status(404).send('Orangtua tidak ditemukan.');
            }

            let setPintu = orangtua.noKursi;

            if (!orangtua.noKursi) {
                const noKursiTerakhirOrangtua = await Orangtua.find({
                    $and: [
                        { noKursi: { $exists: true } },
                        { noKursi: { $regex: `^${getPintu.code}` } }
                    ]
                }).sort({ noKursi: -1 }).limit(1);

                if (noKursiTerakhirOrangtua.length > 0) {
                    let hasil = noKursiTerakhirOrangtua[0].noKursi.slice(2);
                    setPintu = `${getPintu.code}${parseInt(hasil) + 1}`;
                } else {
                    setPintu = `${getPintu.code}1`;
                }

                let updatedPintu = await MejaRegistrasiModel.findByIdAndUpdate(
                    req.body.mejaId,
                    { $inc: { kuota: -1 } },
                    { new: true }
                );
                if (updatedPintu.kuota < 0) {
                    const getAllPintu = await MejaRegistrasiModel.find({
                        kuota: { $gt: 0 }
                    }).sort({ code: 1 }).limit(1);

                    if (getAllPintu.length > 0) {
                        const noKursiTerakhirBaru = await Orangtua.find({
                            $and: [
                                { noKursi: { $exists: true } },
                                { noKursi: { $regex: `^${getAllPintu[0].code}` } }
                            ]
                        }).sort({ noKursi: -1 }).limit(1);

                        if (noKursiTerakhirBaru.length > 0) {
                            let hasilBaru = noKursiTerakhirBaru[0].noKursi.slice(2);
                            setPintu = `${getAllPintu[0].code}${parseInt(hasilBaru) + 1}`;
                        } else {
                            setPintu = `${getAllPintu[0].code}1`;
                        }

                        await MejaRegistrasiModel.findByIdAndUpdate(getAllPintu[0]._id, { $inc: { kuota: -1 } });
                    } else {
                        return res.status(400).send('Semua meja sudah penuh.');
                    }
                }
            }

            const updatedOrangtua = await Orangtua.findByIdAndUpdate(
                req.params.id,
                {
                    isRegis: true,
                    noKursi: setPintu,
                    isRegisBy: req.user.userId
                },
                { new: true }
            );

            if (updatedOrangtua && updatedOrangtua.isRegis && req.enabledFeatures.Konsumsi) {
                await updateKonsumsi(req, res);
            }

            updatedData = updatedOrangtua;
            message = 'Orangtua';
        }

        if (!updatedData) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Data not found' });
        }

        triggerPusher(req.body.mejaId, message, updatedData);

        await session.commitTransaction();
        res.status(StatusCodes.OK).json({ message: message, data: updatedData });
    } catch (error) {
        await session.abortTransaction();
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    } finally {
        session.endSession();
    }
};


export const updateKonsumsi = async (req, res) => {
    try {

        const updatedOrangtua = await Orangtua.findByIdAndUpdate(req.params.id, { isKonsumsi: true, isKonsumsiBy: req.user.userId }, {
            new: true,
        });

        res.status(StatusCodes.OK).json({ message: 'Registration modified', data: updatedOrangtua });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};
