// src/config/columnsConfig.js

import { IoCloseCircle } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import { Registered, Confirm, FormRow } from "../components";
import Konsumsied from "../components/Konsumsied";
import ToggleButton from "../components/SlideOnOff";
import QRCodeCell from "../components/QRcodeCell";
import { deleteMeja, updateMeja } from "../service/Meja.service";
import { toast } from "react-toastify";
import { useCallback } from "react";
import { debounce } from 'lodash';

export const getMahasiswaColumns = (navigate) => [
  {
    name: "No.",
    selector: (row) => row.number,
    width: "3.4rem",
  },
  {
    name: "NIM",
    selector: (row) => row.nim,
    sortable: true,
    width: "6.4rem",
  },
  {
    name: "Nama",
    selector: (row) => row.name,
    sortable: true,
  },
  {
    name: "No Ijazah",
    selector: (row) => row.noIjazah,
    sortable: true,
    width: "9rem",
  },
  {
    name: "Jurusan",
    selector: (row) => row.jurusan,
    sortable: true,
    width: "5.2rem",
  },
  {
    name: "Prodi",
    selector: (row) => row.prodi,
    sortable: true,
  },
  {
    name: "No Kursi",
    selector: (row) => row.noKursi,
    sortable: true,
    width: "5.9rem",
  },
  {
    name: "QR",
    cell: (row) => <QRCodeCell row={row} />,
    // sortable: true,
    width: "5.5rem",
  },
  {
    name: "Registrasi",
    cell: (row) =>
      row.isRegis ? (
        <button
          className="btn regis-btn"
          onClick={() =>
            Registered(
              `/mahasiswa/sudah/${row._id}`,
              navigate,
              "mahasiswa",
              "register"
            )
          }
        >
          <FaCheckCircle size={15} />
        </button>
      ) : (
        <div
          className="btn unregis-btn"
          onClick={() =>
            Registered(
              `/mahasiswa/sudah/${row._id}`,
              navigate,
              "mahasiswa",
              "unregister"
            )
          }
        >
          <IoCloseCircle size={17} />
        </div>
      ),
    width: "5rem",
  },
  {
    name: "Action",
    cell: (row) => (
      <div>
        <button
          className="btn warning-btn"
          style={{ marginRight: "10px" }}
          onClick={() => navigate(`../mahasiswa/edit-mahasiswa/${row._id}`)}
        >
          Edit
        </button>
        <button
          className="btn danger-btn"
          onClick={() => Confirm(row._id, navigate, "mahasiswa")}
        >
          Hapus
        </button>
      </div>
    ),
  },
];

export const getOrangtuaColumns = (navigate) => [
  {
    name: "No.",
    selector: (row) => row.number,
    width: "3.4rem",
  },
  {
    name: "Nama",
    selector: (row) => row.name,
    sortable: true,
  },
  {
    name: "Prodi",
    selector: (row) => row.prodi,
    sortable: true,
  },
  {
    name: "No Kursi",
    selector: (row) => row.noKursi,
    sortable: true,
    width: "5.9rem",
  },
  {
    name: "QR",
    cell: (row) => <QRCodeCell row={row} />,
    // sortable: true,
    width: "5.5rem",
  },
  {
    name: "Registrasi",
    cell: (row) => {
      const mejaId = localStorage.getItem("tableId");
      // console.log(mejaId);

      return row.isRegis ? (
        <button
          className="btn regis-btn"
          onClick={() =>
            Registered(
              `/orangtua/sudah/${row._id}/${mejaId}`,
              navigate,
              "orangtua",
              "register"
            )
          }
        >
          <FaCheckCircle size={15} />
        </button>
      ) : (
        <div
          className="btn unregis-btn"
          onClick={() =>
            Registered(
              `/orangtua/sudah/${row._id}/${mejaId}`,
              navigate,
              "orangtua",
              "unregister"
            )
          }
        >
          <IoCloseCircle size={17} />
        </div>
      );
    },
    width: "5.5rem",
  },
  {
    name: "Konsumsi",
    cell: (row) =>
      row.isKonsumsi ? (
        <button
          className="btn regis-btn"
          onClick={() =>
            Konsumsied(`/orangtua/konsumsi/${row._id}`, navigate, "orangtua")
          }
        >
          <FaCheckCircle size={15} />
        </button>
      ) : (
        <div
          className="btn unregis-btn"
          onClick={() =>
            Konsumsied(`/orangtua/konsumsi/${row._id}`, navigate, "orangtua")
          }
        >
          <IoCloseCircle size={17} />
        </div>
      ),
    width: "5.5rem",
  },
  {
    name: "Action",
    cell: (row) => (
      <div>
        <button
          className="btn warning-btn"
          style={{ marginRight: "10px" }}
          onClick={() => navigate(`../orangtua/edit-orangtua/${row._id}`)}
        >
          Edit
        </button>
        <button
          className="btn danger-btn"
          onClick={() => Confirm(row._id, navigate, "orangtua")}
        >
          Hapus
        </button>
      </div>
    ),
  },
];

export const getColumnsMejas = (
  setMejaValue,
  setIsEditing,
  setEditId,
  fetchMeja
) => [
  {
    name: "No",
    selector: (row) => row.number,
    sortable: true,
  },
  {
    name: "Kode",
    selector: (row) => row.code,
    sortable: true,
  },
  {
    name: "Nama",
    selector: (row) => row.name,
    sortable: true,
  },
  {
    name: "Kuota",
    selector: (row) => {
      // Create a debounced function to update 'meja'
      const debouncedUpdateMeja = useCallback(
        debounce(async (id, value) => {
          try {
            await updateMeja(id, { kuota: value });
            toast.success("Kuota meja berhasil ditambahkan!");
          } catch (error) {
            toast.error("Gagal menambah kuota meja.");
          }
        }, 1000),
        []
      );

      return (
        <div>
          <FormRow
            type="text"
            name="meja"
            defaultValue={row.kuota}
            onChange={(e) => {
              const value = e.target.value;
              debouncedUpdateMeja(row._id, value); // Call the debounced function
            }}
          />
        </div>
      );
    },
    sortable: true,
  },
  {
    name: "Tersedia",
    selector: (row) => row.tersedia,
    sortable: true,
  },
  {
    name: "Action",
    cell: (row) => (
      <div>
        <button
          type="button"
          className="btn warning-btn"
          style={{ marginRight: "10px" }}
          onClick={() => {
            setMejaValue(row.name);
            setIsEditing(true);
            setEditId(row._id);
          }}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn danger-btn"
          onClick={async () => {
            try {
              await deleteMeja(row._id); // Memanggil fungsi delete
              toast.success("Meja berhasil dihapus!");
              fetchMeja(); // Refresh data setelah penghapusan
            } catch (error) {
              toast.error("Gagal menghapus meja.");
            }
          }}
        >
          Hapus
        </button>
      </div>
    ),
  },
];

export const getColumnsActivationFeatures = (navigate) => [
  {
    name: "No",
    selector: (row) => row.number,
    sortable: true,
  },
  {
    name: "Nama",
    selector: (row) => row.featureName,
    sortable: true,
  },
  {
    name: "Action",
    cell: (row) => (
      <div>
        <ToggleButton
          id={row._id}
          featureName={row.featureName}
          isEnabled={row.isEnabled}
        />
      </div>
    ),
  },
  {
    name: "Action",
    cell: (row) => (
      <div>
        <button
          className="btn warning-btn"
          style={{ marginRight: "10px" }}
          onClick={() => navigate(`../settings/edit-settings/${row._id}`)}
        >
          Edit
        </button>
        <button
          className="btn danger-btn"
          onClick={() => Confirm(row._id, navigate, "settings")}
        >
          Hapus
        </button>
      </div>
    ),
  },
];

export const getColumnsUsers = (navigate) => [
  {
    name: "No",
    selector: (row) => row.number,
    sortable: true,
  },
  {
    name: "Nama",
    selector: (row) => row.name,
    sortable: true,
  },
  {
    name: "Email",
    selector: (row) => row.email,
    sortable: true,
  },
  {
    name: "Role",
    selector: (row) => row.role,
    sortable: true,
  },
  {
    name: "Action",
    cell: (row) => (
      <div>
        <button
          className="btn warning-btn"
          style={{ marginRight: "10px" }}
          onClick={() => navigate(`../edit-user/${row._id}`)}
        >
          Edit
        </button>
      </div>
    ),
  },
];
