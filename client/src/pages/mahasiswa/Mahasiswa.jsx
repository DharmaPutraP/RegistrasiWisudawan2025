import { toast } from "react-toastify";
import {
  SearchContainer,
  // Tab,
  Table,
  LabelButton,
} from "../../components";
import customFetch from "../../utils/customFetch";
import { useLoaderData } from "react-router-dom";
import { useContext, createContext } from "react";
import TabelContainer from "../../assets/wrappers/Tabel";
import { useSettingsContext } from "../../pages/settings/SettingsContext";

const AllMahasiswasContext = createContext();

export const loader = async ({ request }) => {
  try {
    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries(),
    ]);
    const { data } = await customFetch.get("/mahasiswa", {
      params,
    });

    return { data, searchValues: { ...params } };
  } catch (error) {
    toast.error(error.response.data.msg);
    return error;
  }
};

const Mahasiswa = () => {
  const { data, searchValues } = useLoaderData();

  const { settings } = useSettingsContext();
  const { Email } = settings;

  return (
    <AllMahasiswasContext.Provider value={{ data, searchValues }}>
      {/* <Tab /> */}
      <TabelContainer>
        <LabelButton
          title={"Mahasiswa"}
          linkUrl={"../mahasiswa/tambah-mahasiswa"}
        />
        <SearchContainer context={searchValues} formTitle="Cari Mahasiswa" />
        <Table titleTable={"Seluruh Mahasiswa"} context={data} />
      </TabelContainer>
    </AllMahasiswasContext.Provider>
  );
};

export const useAllMahasiswaContext = () => useContext(AllMahasiswasContext);

export default Mahasiswa;
