import { readFile } from "fs/promises";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./models/UserModel.js";
import Mahasiswa from "./models/MahasiswaModel.js";
try {
  await mongoose.connect(process.env.MONGO_URL);
  const user = await User.findOne({ email: "fellychndr@gmail.com" });

  const jsonJobs = JSON.parse(
    await readFile(new URL("./utils/mhsData.json", import.meta.url))
  );
  const mahasiswa = jsonJobs.map((mahasiswa) => {
    const inputSeatNumber = mahasiswa.noKursi;
    let formattedSeatNumber;
    if (inputSeatNumber && inputSeatNumber.includes(".")) {
      const [letterPart, numberPart] = inputSeatNumber.split(".");
      const formattedNumberPart = String(numberPart).padStart(3, "0");
      formattedSeatNumber = letterPart + "." + formattedNumberPart;
    } else {
      console.error("Nomor kursi tidak valid.");
    }
    mahasiswa.noKursi = formattedSeatNumber;
    return { ...mahasiswa };
  });
  console.log(user);
  await Mahasiswa.deleteMany({});
  await Mahasiswa.create(mahasiswa, { createdBy: user._id });
  console.log("Success!!!");
  process.exit(0);
} catch (error) {
  console.log(error);
  process.exit(1);
}
