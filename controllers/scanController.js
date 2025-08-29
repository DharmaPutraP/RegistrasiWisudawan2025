import Mahasiswa from "../models/MahasiswaModel.js";
import Orangtua from "../models/OrangtuaModel.js";
import { StatusCodes } from "http-status-codes";
import { triggerPusher } from "../utils/triggerPusher.js";
// import MejaRegistrasiModel from '../models/MejaRegistrasiModel.js';
import mongoose, { set } from "mongoose";

export const updateScan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let isRegis = true;
    let updatedData;
    let message;
    if (!req.enabledFeatures.Registrasi) {
      if (req.enabledFeatures.Konsumsi) {
        // Jika fitur Konsumsi diaktifkan
        await updateKonsumsi(req, res);
        return;
      } else {
        // Jika fitur Konsumsi dinonaktifkan
        return res.status(StatusCodes.NOT_ACCEPTABLE).json({
          message: "Pengambilan Konsumsi Tidak Diizinkan!",
        });
      }
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .json({ message: "Registrasi Tidak Diizinkan!" });
    }

    const updatedMahasiswa = await Mahasiswa.findByIdAndUpdate(
      req.params.id,
      { isRegis: isRegis, isRegisBy: req.user.userId },
      {
        new: true,
      }
    );

    if (updatedMahasiswa) {
      updatedData = updatedMahasiswa;
      message = "Mahasiswa";
    } else {
      const mejaId = req.body.mejaId;
      // const getPintu = await MejaRegistrasiModel.findById(mejaId);

      // if (!getPintu) {
      //     return res.status(404).json({message : "Meja tidak ditemukan."});
      // }

      const orangtua = await Orangtua.findById(req.params.id);

      if (!orangtua) {
        return res.status(404).json({ message: "Orangtua tidak ditemukan." });
      }

      // let setPintu = orangtua.noKursi;

      // if (!orangtua.noKursi) {
      //     if (getPintu.kuota > 0) {
      //         // Cari semua nomor kursi yang sudah di-assign dengan kode meja yang sama (tanpa sorting dari MongoDB)
      //         const noKursiOrangtua = await Orangtua.find({
      //             noKursi: { $regex: `^${getPintu.code}` },
      //         });

      //         // Sorting hasil query di sisi JavaScript berdasarkan bagian numerik
      //         const sortedNoKursiOrangtua = noKursiOrangtua.sort((a, b) => {
      //             const aNum = parseInt(a.noKursi.slice(getPintu.code.length), 10);
      //             const bNum = parseInt(b.noKursi.slice(getPintu.code.length), 10);
      //             return bNum - aNum;
      //         });
      //         // Jika ada nomor kursi terakhir, tambah 1 untuk mendapatkan nomor baru
      //         if (sortedNoKursiOrangtua.length > 0) {
      //             let nomorTerakhir = sortedNoKursiOrangtua[0].noKursi.slice(getPintu.code.length); // Ambil bagian nomor saja
      //             setPintu = `${getPintu.code}${parseInt(nomorTerakhir, 10) + 1}`;
      //         } else {
      //             setPintu = `${getPintu.code}1`; // Jika belum ada kursi, mulai dari 1
      //         }

      //         // Kurangi kuota meja yang dipilih
      //         await MejaRegistrasiModel.findByIdAndUpdate(
      //             mejaId,
      //             { $inc: { kuota: -1 } },
      //             { new: true }
      //         );
      //     } else {
      //         // Jika kuota meja penuh, cari meja lain yang masih ada kuota
      //         const getAllPintu = await MejaRegistrasiModel.find({
      //             kuota: { $gt: 0 },
      //         })
      //             .sort({ code: 1 })
      //             .limit(1);

      //         if (getAllPintu.length > 0) {
      //             const noKursiOrangtuaBaru = await Orangtua.find({
      //                 noKursi: { $regex: `^${getAllPintu[0].code}` },
      //             });

      //             // Sorting berdasarkan bagian numerik
      //             const sortedNoKursiOrangtuaBaru = noKursiOrangtuaBaru.sort((a, b) => {
      //                 const aNum = parseInt(a.noKursi.slice(getAllPintu[0].code.length), 10);
      //                 const bNum = parseInt(b.noKursi.slice(getAllPintu[0].code.length), 10);
      //                 return bNum - aNum;
      //             });

      //             if (sortedNoKursiOrangtuaBaru.length > 0) {
      //                 let nomorTerakhirBaru = sortedNoKursiOrangtuaBaru[0].noKursi.slice(getAllPintu[0].code.length);
      //                 setPintu = `${getAllPintu[0].code}${parseInt(nomorTerakhirBaru, 10) + 1}`;
      //             } else {
      //                 setPintu = `${getAllPintu[0].code}1`;
      //             }

      //             // Update kuota di meja baru
      //             await MejaRegistrasiModel.findByIdAndUpdate(getAllPintu[0]._id, {
      //                 $inc: { kuota: -1 },
      //             });
      //         } else {
      //             return res.status(400).json({ message: "Semua meja sudah penuh." });
      //         }
      //     }
      // }

      const updatedOrangtua = await Orangtua.findByIdAndUpdate(
        req.params.id,
        {
          isRegis: true,
          // noKursi: setPintu,
          isRegisBy: req.user.userId,
        },
        { new: true }
      );

      if (
        updatedOrangtua &&
        updatedOrangtua.isRegis &&
        req.enabledFeatures.Konsumsi
      ) {
        await updateKonsumsi(req, res);
      }

      updatedData = updatedOrangtua;
      message = "Orangtua";
    }

    if (!updatedData) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Data not found" });
    }

    // triggerPusher(null, message, updatedData);

    await session.commitTransaction();
    res.status(StatusCodes.OK).json({ message: message, data: updatedData });
  } catch (error) {
    await session.abortTransaction();
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const updateKonsumsi = async (req, res) => {
  try {
    const updatedOrangtua = await Orangtua.findByIdAndUpdate(
      req.params.id,
      { isKonsumsi: true, isKonsumsiBy: req.user.userId },
      {
        new: true,
      }
    );

    res
      .status(StatusCodes.OK)
      .json({ message: "Registration modified", data: updatedOrangtua });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};
