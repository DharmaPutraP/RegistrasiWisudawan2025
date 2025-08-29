import DataTable from "react-data-table-component";
import { useLocation, useNavigate } from "react-router-dom";
import TabelContainer from "../assets/wrappers/Tabel";
import { useDashboardContext } from "../pages/DashboardLayout";
import {
  getMahasiswaColumns,
  getOrangtuaColumns,
  getColumnsUsers,
} from "../utils/columns";
import { BiExport, BiSend } from "react-icons/bi";
import customFetch from "../utils/customFetch";
import { toast } from "react-toastify";

export const checkDefaultTheme = () => {
  const isDarkThemes = localStorage.getItem("darkTheme") === "true";
  return isDarkThemes === true ? "dark" : "default";
};

const Table = ({ titleTable, context, email = false }) => {
  const { isDarkTheme } = useDashboardContext();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();

  const { data, total } = context;

  let columns,
    linkUrl = "";

  if (pathname.includes("/mahasiswa")) {
    columns = getMahasiswaColumns(navigate);
    linkUrl = "mahasiswa";
  } else if (pathname.includes("/orangtua")) {
    columns = getOrangtuaColumns(navigate);
    linkUrl = "orangtua";
  } else if (pathname.includes("/admin")) {
    columns = getColumnsUsers(navigate);
    linkUrl = "admin";
  }

  const handlePageChange = (page) => {
    const searchParams = new URLSearchParams(search);
    searchParams.set("page", page);
    navigate(`${pathname}?${searchParams.toString()}`);
  };

  const handlePerRowsChange = (limit) => {
    const searchParams = new URLSearchParams(search);
    searchParams.set("limit", limit);
    navigate(`${pathname}?${searchParams.toString()}`);
  };

  const handleExportPDF = async () => {
    try {
      const response = await customFetch.get(`${linkUrl}/export`, {
        responseType: "blob",
      });

      console.log(response);

      const blob = new Blob([response.data], { type: response.data.type });
      console.log(blob);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${linkUrl}.pdf`;
      link.click();
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await customFetch.post("mahasiswa/send-email");
      if (response.data && response.data.success) {
        toast.success("Email berhasil dikirim ke seluruh mahasiswa.");
      } else {
        toast.error("Gagal mengirim email ke mahasiswa.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengirim email ke mahasiswa.");
      console.error(error);
    }
  };

  return (
    <TabelContainer>
      <DataTable
        columns={columns}
        data={data}
        title={titleTable}
        pagination
        paginationServer
        paginationTotalRows={total}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
        fixedHeader
        theme={checkDefaultTheme()}
        highlightOnHover
        actions={
          linkUrl == "admin" ? (
            ""
          ) : linkUrl == "mahasiswa" ? (
            <>
              <button type="button" className="btn" onClick={handleExportPDF}>
                <BiExport size={15} style={{ marginRight: "0.3rem" }} /> Export
                PDF
              </button>
              <button type="button" className="btn" onClick={handleSendEmail}>
                <BiSend size={15} style={{ marginRight: "0.4rem" }} />
                Kirim Email
              </button>
            </>
          ) : (
            <button type="button" className="btn" onClick={handleExportPDF}>
              <BiExport size={15} style={{ marginRight: "0.3rem" }} /> Export
              PDF
            </button>
          )
        }
      />
    </TabelContainer>
  );
};

export default Table;
