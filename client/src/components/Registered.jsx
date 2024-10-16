import Swal from "sweetalert2";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";

const registered = async (linkUrl, navigate, url, status) => {
  const Data = async () => {
    let textPeringatan = "";
    let textConfirm = "";
    let textSucces = "";
    let textStatus = "Berhasil";

    if (url === "mahasiswa" || url === "orangtua") {
      const entity = url === "mahasiswa" ? "Mahasiswa" : "Orangtua";
      const isRegistered = status === "register";

      if (isRegistered) {
        textPeringatan = `${entity} akan dibatalkan registrasinya.`;
        textConfirm = `Ya, batalkan!`;
        textSucces = `${entity} berhasil dibatalkan registrasinya.`;
      } else {
        textPeringatan = `${entity} akan diregistrasi.`;
        textConfirm = `Ya, registrasikan!`;
        textSucces = `${entity} berhasil diregistrasi.`;
      }
    }

    return {
      textPeringatan,
      textConfirm,
      textSucces,
      textStatus
    };
  };

  // Contoh pemanggilan fungsi
  const { textPeringatan, textConfirm, textSucces, textStatus } = await Data();

  Swal.fire({
    title: "Apakah Kamu Yakin?",
    text: textPeringatan,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: textConfirm,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await customFetch.patch(linkUrl);
        navigate(`/dashboard/${url}`);
        Swal.fire({
          title: textStatus,
          text: textSucces,
          icon: "success",
        });
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message || "Terjadi kesalahan saat registrasi.";
        toast.error(errorMessage);
      }
    }
  })
  .catch((error) => {
    toast.error(error?.message || "Terjadi kesalahan yang tidak terduga.");
  });
};

export default registered;
