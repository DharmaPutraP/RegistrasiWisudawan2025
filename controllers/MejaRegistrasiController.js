import Meja from "../models/MejaRegistrasiModel.js";
import { StatusCodes } from "http-status-codes";

export const getAllMeja = async (req, res) => {
    const { search } = req.query;

    console.log(req.query);

    let queryObject = {
        // isDeleted: false
    };

    if (search) {
        queryObject = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
            ]
        };
    }


    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const meja = await Meja.find(queryObject).skip(skip).limit(limit);

        const mejaWithNumber = meja.map((loket, index) => ({
            ...loket.toObject(),
            number: skip + index + 1
        }));


        const totalMejas = await Meja.countDocuments(queryObject);

        const numOfPages = Math.ceil(totalMejas / limit);
        res.status(StatusCodes.OK).json({ total: totalMejas, numOfPages, currentPage: page, data: mejaWithNumber });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

export const createMeja = async (req, res) => {
    try {
        req.body.createdBy = req.user.userId;
        const meja = await Meja.create(req.body);
        res.status(StatusCodes.CREATED).json({ data: meja });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

export const getMeja = async (req, res) => {
    try {
        const meja = await Meja.findById({ _id: req.params.id });
        res.status(StatusCodes.OK).json({ meja });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

export const updateMeja = async (req, res) => {
    const {name,code, kuota, tersedia } = req.body
    try {
        const meja = await Meja.findByIdAndUpdate(req.params.id, { name: name, code: code, kuota: kuota, tersedia: tersedia, updatedBy: req.user.userId }, {
            new: true,
        });
        res.status(StatusCodes.OK).json({ meja });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

export const deleteMeja = async (req, res) => {
    try {
        const { id } = req.params
        const meja = await Meja.findByIdAndDelete(id)
        res.status(StatusCodes.OK).json({ msg: 'Meja deleted', meja })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}