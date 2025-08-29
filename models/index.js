import mongoose from "mongoose";
import JurusanProdi from "./JurusanProdiModel.js";

const newData = await JurusanProdi.create({
  jurusan: "JTI",
  prodi: "Teknik Informatika",
  createdBy: new mongoose.Types.ObjectId("68465c3d14311114700c0e76"),
});
