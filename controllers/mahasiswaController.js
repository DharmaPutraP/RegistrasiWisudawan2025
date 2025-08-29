import nodemailer from "nodemailer";
import { StatusCodes } from "http-status-codes";
import Mahasiswa from "../models/MahasiswaModel.js";
import qrcode from "qrcode";
import path from "path";
import XLSX from "xlsx";
import PDFDocument from "pdfkit";
import fs from "fs";
import { fileURLToPath } from "url";
import { PRODI } from "../utils/constants.js";

export const getAllMahasiswas = async (req, res) => {
  const { search, jurusan, prodi, isRegis, sort } = req.query;

  let queryObject = {
    isRegis: false,
    isDeleted: false,
  };

  if (search) {
    queryObject = {
      $or: [
        { nim: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { noIjazah: { $regex: search, $options: "i" } },
        { jurusan: { $regex: search, $options: "i" } },
        { prodi: { $regex: search, $options: "i" } },
        { noKursi: { $regex: search, $options: "i" } },
      ],
    };
  }
  if (isRegis && isRegis == "true") {
    queryObject.isRegis = true;
  }
  if (jurusan && jurusan !== "all") {
    queryObject.jurusan = jurusan;
  }
  if (prodi && prodi !== "all") {
    queryObject.prodi = prodi;
  }

  const sortOptions = {
    newest: "-createdAt",
    oldest: "createdAt",
    "a-z": "name",
    "z-a": "-name",
    "No Kursi - ASC": "noKursi",
    "No Kursi - DESC": "-noKursi",
    NoKursiASC: "noKursi",
  };
  const sortKey = sortOptions[sort] || sortOptions.NoKursiASC;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  //option untuk qr code
  const opts = {
    errorCorrectionLevel: "H",
    type: "image/jpeg",
    quality: 0.3,
    margin: 1.2,
    color: {
      dark: "#000",
      light: "#FFFF",
    },
    width: 250,
  };

  try {
    const mahasiswas = await Mahasiswa.find(queryObject)
      .sort(sortKey)
      .skip(skip)
      .limit(limit);

    const mahasiswasWithNumber = mahasiswas.map((mahasiswa, index) => ({
      ...mahasiswa.toObject(),
      number: skip + index + 1,
    }));

    const mahasiswasWithQRCodes = await Promise.all(
      mahasiswas.map(async (mahasiswa, index) => {
        const src = await qrcode.toDataURL(mahasiswa._id.toString(), opts); // Menghasilkan kode QR berdasarkan ID mahasiswa
        return {
          ...mahasiswa.toObject(),
          number: skip + index + 1,
          qr_code: src,
        };
      })
    );

    const totalMahasiswas = await Mahasiswa.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalMahasiswas / limit);

    res.status(StatusCodes.OK).json({
      total: totalMahasiswas,
      numOfPages,
      currentPage: page,
      data: mahasiswasWithQRCodes,
      qrcode: mahasiswasWithQRCodes,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const createMahasiswa = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;
    const mahasiswa = await Mahasiswa.create(req.body);
    res.status(StatusCodes.CREATED).json({ mahasiswa });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const getMahasiswa = async (req, res) => {
  try {
    const mahasiswa = await Mahasiswa.findById(req.params.id);
    res.status(StatusCodes.OK).json({ mahasiswa });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const updateMahasiswa = async (req, res) => {
  try {
    req.body.updatedBy = req.user.userId;
    const updatedMahasiswa = await Mahasiswa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res
      .status(StatusCodes.OK)
      .json({ msg: "Mahasiswa modified", mahasiswa: updatedMahasiswa });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const updateMahasiswaRegister = async (req, res) => {
  try {
    if (req.enabledFeatures.Registrasi) {
      let isRegis = true;
      const protocolLength = req.headers.referer.startsWith("https://") ? 8 : 7;
      const urlAfterProtocol = req.headers.referer.substring(protocolLength);

      if (urlAfterProtocol.includes("isRegis=true")) {
        isRegis = false;
      }

      const updatedMahasiswa = await Mahasiswa.findByIdAndUpdate(
        req.params.id,
        { isRegis: isRegis, isRegisBy: req.user.userId },
        {
          new: true,
        }
      );
      res.status(StatusCodes.OK).json({
        msg: "Mahasiswa Registered modified",
        mahasiswa: updatedMahasiswa,
      });
    } else {
      res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .json({ message: "Registrasi Tidak Diizinkan" });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const deleteMahasiswa = async (req, res) => {
  try {
    const mahasiswa = await Mahasiswa.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedBy: req.user.userId,
    });
    res
      .status(StatusCodes.OK)
      .json({ msg: "Mahasiswa deleted", mahasiswa: mahasiswa });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const showStats = async (req, res) => {
  try {
    const dataMahasiswa = await Mahasiswa.find({ isDeleted: false });
    const dataMahasiswaUnregistered = await Mahasiswa.find({
      isRegis: false,
      isDeleted: false,
    });
    const totalMahasiswaRegistered = await Mahasiswa.countDocuments({
      isRegis: true,
      isDeleted: false,
    });
    const totalMahasiswaUnregistered = await Mahasiswa.countDocuments({
      isRegis: false,
      isDeleted: false,
    });

    // Menghitung statistik berdasarkan jurusan
    const statsByJurusanRegistered = await Mahasiswa.aggregate([
      { $match: { isRegis: true, isDeleted: false } },
      { $group: { _id: "$jurusan", count: { $sum: 1 } } },
    ]);
    const statsByJurusanUnregistered = await Mahasiswa.aggregate([
      { $match: { isRegis: false, isDeleted: false } },
      { $group: { _id: "$jurusan", count: { $sum: 1 } } },
    ]);

    // Mengubah hasil statistik berdasarkan jurusan menjadi objek dengan jurusan sebagai kunci
    const statsByJurusanUnregisteredObj = statsByJurusanUnregistered.reduce(
      (acc, curr) => {
        const { _id: jurusan, count } = curr;
        acc[jurusan] = count;
        return acc;
      },
      {}
    );
    const statsByJurusanRegisteredObj = statsByJurusanRegistered.reduce(
      (acc, curr) => {
        const { _id: jurusan, count } = curr;
        acc[jurusan] = count;
        return acc;
      },
      {}
    );

    let Registered = {};
    let UnRegistered = {};
    let data = [];
    let obj = {};
    // Inisialisasi semua prodi dengan nilai 0 di Registered dan UnRegistered
    Object.values(PRODI).forEach((prodi) => {
      Registered[prodi] = 0;
      UnRegistered[prodi] = 0;
    });

    // Iterasi melalui data mahasiswa yang sudah terdaftar
    dataMahasiswa.forEach((mahasiswa) => {
      if (Object.values(PRODI).includes(mahasiswa.prodi) && mahasiswa.isRegis) {
        // Tambahkan jika mahasiswa terdaftar pada prodi tersebut
        Registered[mahasiswa.prodi] += 1;
      } else if (
        Object.values(PRODI).includes(mahasiswa.prodi) &&
        !mahasiswa.isRegis
      ) {
        UnRegistered[mahasiswa.prodi] += 1;
      }
    });
    // console.log(Registered);

    Object.values(PRODI).forEach((prodi) => {
      // console.log(Registered[prodi]);

      obj = {
        name: prodi,
        registered: Registered[prodi],
        unregistered: UnRegistered[prodi],
      };
      data.push(obj);
    });

    // console.log("Registered:", Registered);
    // console.log("UnRegistered:", UnRegistered);
    // console.log("data:", data);

    const graphData = data;
    // const graphData = {
    //     Registered,
    //     UnRegistered
    // }

    // Membuat objek defaultStats dengan total seluruh mahasiswa dan statistik berdasarkan jurusan
    const defaultStats = {
      ALL: {
        REGISTERED: totalMahasiswaRegistered || 0,
        UNREGISTERED: totalMahasiswaUnregistered || 0,
      },
      JTI: {
        REGISTERED: statsByJurusanRegisteredObj.JTI || 0,
        UNREGISTERED: statsByJurusanUnregisteredObj.JTI || 0,
      },
      JTIN: {
        REGISTERED: statsByJurusanRegisteredObj.JTIN || 0,
        UNREGISTERED: statsByJurusanUnregisteredObj.JTIN || 0,
      },

      AKTP: {
        REGISTERED: statsByJurusanRegisteredObj.AKTP || 0,
        UNREGISTERED: statsByJurusanUnregisteredObj.AKTP || 0,
      },
    };

    res.status(StatusCodes.OK).json({ defaultStats, graphData });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const getExportMhs = async (req, res) => {
  let queryObject = {
    isRegis: false,
    isDeleted: false,
  };
  //option untuk qr code
  const opts = {
    errorCorrectionLevel: "H",
    type: "image/jpeg",
    quality: 0.3,
    margin: 1.2,
    color: {
      dark: "#000",
      light: "#FFFF",
    },
    width: 240,
  };

  try {
    const mahasiswas = await Mahasiswa.find(queryObject);
    const mahasiswasWithQRCodes = await Promise.all(
      mahasiswas.map(async (mahasiswa, index) => {
        const src = await qrcode.toDataURL(mahasiswa._id.toString(), opts);
        return {
          ...mahasiswa.toObject(),
          number: index + 1,
          qr_code: src,
        };
      })
    );

    const totalMahasiswas = await Mahasiswa.countDocuments(queryObject);
    return { total: totalMahasiswas, data: mahasiswasWithQRCodes };
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const importDataMhs = async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    let jurusan = "";
    for (const item of data) {
      const inputSeatNumber = item.noKursi;
      let formattedSeatNumber;
      if (inputSeatNumber && inputSeatNumber.includes(".")) {
        const [letterPart, numberPart] = inputSeatNumber.split(".");
        const formattedNumberPart = String(numberPart).padStart(3, "0");
        formattedSeatNumber = letterPart + "." + formattedNumberPart;
      } else {
        console.error("Nomor kursi tidak valid.");
        continue;
      }

      let prodi = item.prodi
        .replace("-", "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();

      if (item.jurusan === "Akuntansi Perpajakan") {
        jurusan = item.jurusan.replace("Akuntansi Perpajakan", "AKTP");
      } else if (item.jurusan === "Teknik Industri") {
        jurusan = item.jurusan.replace("Teknik Industri", "JTIN");
      } else if (item.jurusan === "Teknologi Informasi") {
        jurusanMAHAS = item.jurusan.replace("Teknologi Informasi", "JTI");
      } else {
        console.log("jurusan tidak ditemukan");
      }

      const mahasiswa = new Mahasiswa({
        nim: item.nim,
        name: item.name,
        noIjazah: item.noIjazah,
        prodi: prodi,
        jurusan: jurusan,
        ipk: item.ipk,
        noKursi: formattedSeatNumber,
      });

      try {
        await mahasiswa.save();
        console.log(`Data mahasiswa ${mahasiswa.name} berhasil disimpan.`);
      } catch (error) {
        console.error(`Gagal menyimpan data mahasiswa: ${error.message}`);
      }
    }

    res.status(StatusCodes.OK).json({ data: "Berhasil mengimport data" });
  } catch (error) {
    console.log(error);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const exportPdfDataMhs = async (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  try {
    const { data } = await getExportMhs(req, res);

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Menentukan path file PDF yang akan disimpan ke folder public
    const filePath = path.join(
      __dirname,
      "../public/exports",
      "mahasiswas.pdf"
    );

    // Buat stream untuk menyimpan file PDF
    const writeStream = fs.createWriteStream(filePath);

    // Piping PDF ke file
    doc.pipe(writeStream);

    // Isi konten PDF
    doc.fontSize(12).text("Data Mahasiswa", { align: "center" });

    data.forEach((mahasiswa) => {
      // Estimasi tinggi data dan QR code
      const dataHeight = 100;

      // Cek apakah ruang cukup di halaman saat ini
      if (doc.y + dataHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
      }

      doc.moveDown();
      doc
        .fontSize(10)
        .text(`No: ${mahasiswa.number}`, 50)
        .text(`NIM: ${mahasiswa.nim}`, 50)
        .text(`Nama: ${mahasiswa.name}`, 50)
        .text(`Jurusan: ${mahasiswa.jurusan}`, 50)
        .text(`Prodi: ${mahasiswa.prodi}`, 50)
        .text(`No Kursi: ${mahasiswa.noKursi}`, 50)
        .text(`No Ijazah: ${mahasiswa.noIjazah}`, 50);

      // Menambahkan gambar QR code di sebelah kanan data
      doc.image(mahasiswa.qr_code, doc.page.width - 150, doc.y - 94, {
        fit: [100, 100],
        align: "right",
        valign: "center",
      });

      doc.moveDown(1);
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke();
    });

    // Selesaikan dokumen PDF
    doc.end();

    // Tunggu sampai proses penulisan selesai
    writeStream.on("finish", () => {
      console.log("PDF generated successfully!");
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          console.log(err);
        } else {
          fs.unlinkSync(filePath);
          console.log("PDF file deleted after sending.");
        }
      });
    });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ message: "Error generating PDF", error: error.message });
  }
};

export const sendEmailToMahasiswa = async (req, res) => {
  try {
    const mahasiswas = await Mahasiswa.find({
      email: { $ne: null, $ne: "" },
      isDeleted: false,
    });
    if (!mahasiswas.length) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Tidak ada mahasiswa dengan email." });
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER || "tumbal3014@gmail.com",
        pass: process.env.EMAIL_PASS || "oufo rput cvqv ayun",
      },
    });

    // Opsi QR code
    const opts = {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.3,
      margin: 1.2,
      color: "#FFFF",
      width: 250,
    };

    let successCount = 0;
    let failCount = 0;
    for (const mhs of mahasiswas) {
      // Generate QR code untuk NIM
      const qrCodeDataUrl = await qrcode.toDataURL(mhs._id.toString(), opts);
      // Ambil base64 data
      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");

      const mailOptions = {
        to: mhs.email,
        from: process.env.EMAIL_USER || "tumbal3014@gmail.com",
        subject: "Informasi Wisuda PCR 2024 - NIM & QR Code",
        html: `<p>Halo ${mhs.name},</p>
          <p>Berikut adalah NIM Anda: <b>${mhs.nim}</b></p>
          <p>Silakan scan QR code berikut untuk keperluan registrasi wisuda:</p>
          <img src="cid:qrcode${mhs._id}" alt="QR Code" style="width:150px;height:150px;"/>
          <p>Terima kasih.</p>`,
        attachments: [
          {
            filename: `qrcode-${mhs.nim}.png`,
            content: Buffer.from(base64Data, "base64"),
            cid: `qrcode${mhs._id}`,
          },
        ],
      };
      try {
        await transporter.sendMail(mailOptions);
        successCount++;
      } catch (err) {
        failCount++;
        console.error(`Gagal mengirim ke ${mhs.email}:`, err.message);
      }
    }

    res
      .status(StatusCodes.OK)
      .json({ success: true, sent: successCount, failed: failCount });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

// export const exportPdfDataMhs = async (req, res) => {
//     try {
//         const { data } = await getExportMhs(req, res);

//         const doc = new PDFDocument({ size: 'A4', margin: 50 });

//         res.setHeader('Content-Disposition', 'attachment; filename=mahasiswas.pdf');
//         res.setHeader('Content-Type', 'application/pdf');

//         doc.pipe(res);

//         doc.fontSize(12).text('Data Mahasiswa', { align: 'center' });

//         data.forEach((mahasiswa, i) => {
//             // Estimasi tinggi data dan QR code
//             const dataHeight = 100;

//             // Cek apakah ruang cukup di halaman saat ini
//             if (doc.y + dataHeight > doc.page.height - doc.page.margins.bottom) {
//                 doc.addPage();
//             }

//             doc.moveDown();
//             doc.fontSize(10)
//                 .text(`No: ${mahasiswa.number}`, 50)
//                 .text(`NIM: ${mahasiswa.nim}`, 50)
//                 .text(`Nama: ${mahasiswa.name}`, 50)
//                 .text(`Jurusan: ${mahasiswa.jurusan}`, 50)
//                 .text(`Prodi: ${mahasiswa.prodi}`, 50)
//                 .text(`No Kursi: ${mahasiswa.noKursi}`, 50)
//                 .text(`No Ijazah: ${mahasiswa.noIjazah}`, 50, doc.y)

//             // Menambahkan gambar QR code di sebelah kanan data
//             doc.image(mahasiswa.qr_code, doc.page.width - 150, doc.y - 94, {
//                 fit: [100, 100],
//                 align: 'right',
//                 valign: 'center'
//             });

//             doc.moveDown(1);
//         });

//         doc.end();
//     }  catch (error) {
//         res.status(500).json({ message: 'Error generating PDF', error: error.message });
//     }
// }
