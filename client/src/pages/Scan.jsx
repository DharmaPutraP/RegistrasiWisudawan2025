import { useState, useEffect } from "react";
import Html5QrcodePlugin from "../components/Html5QrcodePlugin.jsx";
import Wrapper from "../assets/wrappers/DashboardFormPage.js";
import styled from "styled-components";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch.jsx";
import Fail from "../assets/audio/fail1.mp3";
import Yay from "../assets/audio/yay.mp3";
import Modal from "../components/Modal.jsx";
import { useSettingsContext } from "../pages/settings/SettingsContext";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0rem 1rem 1rem;
  .Result-container {
    min-width: 600px;
    display: block;
    margin: 10px auto;
    text-align: center;
    padding: 0 2rem;
  }
  .Result-header {
    font-size: 16pt;
    margin-bottom: 20px;
  }
`;

const Scan = () => {
  const { settings } = useSettingsContext();
  const [decodedText, setDecodedText] = useState(null);
  const [loadedData, setLoadedData] = useState(null);
  const [showData, setShowData] = useState(false);
  // const [selectedMeja, setSelectedMeja] = useState(
  //   localStorage.getItem("tableId") || ""
  // );
  // const [mejas, setMeja] = useState([]);
  // const [isModalOpen, setIsModalOpen] = useState(!selectedMeja);
  const [lastScannedQR, setLastScannedQR] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { Konsumsi, Registrasi } = settings;

  // Fetch Meja List
  // const fetchMejas = async () => {
  //   try {
  //     const { data } = await customFetch.get("settings/meja");
  //     setMeja(data.data || []);
  //   } catch (error) {
  //     toast.error("Gagal mengambil data meja");
  //   }
  // };

  // Fetch Data by ID (Mahasiswa/Orangtua)
  const fetchDataById = async (id) => {
    try {
      const { data } = await customFetch.get(`/scan/${id}`);
      return data;
    } catch (error) {
      toast.error("QR tidak valid");
    }
  };

  // Register Mahasiswa or Orangtua
  const registerUser = async (id, mejaId) => {
    try {
      const { data } = await customFetch.patch(`/scan/${id}`, { mejaId });
      const userRegisterData = await fetchDataById(decodedText);
      setLoadedData(userRegisterData);
      setShowData(true);
      setTimeout(() => setShowData(false), 4000);
      if (
        userRegisterData.message == "Mahasiswa" ||
        (userRegisterData.message == "Orangtua" &&
          userRegisterData.data.isRegis === true)
      ) {
        toast.success("Berhasil Registrasi");
      }
      return data;
    } catch (error) {
      new Audio(Fail).play();
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
    }
  };

  // Handle Table Selection
  // const handleTableSelection = (event) => {
  //   const mejaId = event.target.value;
  //   localStorage.setItem("tableId", mejaId);
  //   setSelectedMeja(mejaId);
  //   setIsModalOpen(false);
  // };

  // const handleDeleteMeja = () => {
  //   localStorage.removeItem("tableId");
  //   setIsModalOpen(true);
  // };

  useEffect(() => {
    const handleScanResult = async () => {
      if (!decodedText || isProcessing) return;

      if (decodedText === lastScannedQR) {
        toast.info("QR sudah diproses, tunggu beberapa saat.");
        return;
      }

      setIsProcessing(true);
      setLastScannedQR(decodedText);

      const dataRegistered = await fetchDataById(decodedText);

      if (!dataRegistered) {
        setIsProcessing(false);
        return;
      }

      const { isRegis, isKonsumsi } = dataRegistered.data;

      if (Registrasi || Konsumsi) {
        if (isRegis && isKonsumsi) {
          toast.error(
            "Anda telah melakukan registrasi dan mengambil konsumsi!"
          );
          new Audio(Fail).play();
        } else if (
          Konsumsi &&
          isRegis &&
          !isKonsumsi &&
          dataRegistered.message != "Mahasiswa"
        ) {
          // await registerUser(decodedText, selectedMeja);
          await registerUser(decodedText);
          toast.success("Anda berhasil mengambil konsumsi!");
          // new Audio(Yay).play();
        } else if (isRegis) {
          toast.error("Anda telah melakukan registrasi!");
          new Audio(Fail).play();
        } else {
          // await registerUser(decodedText, selectedMeja);
          await registerUser(decodedText);
        }
      } else {
        toast.error("Registrasi ditutup!");
        new Audio(Fail).play();
      }

      setTimeout(() => {
        setIsProcessing(false);
        setLastScannedQR(null);
      }, 1000);
    };

    handleScanResult();
  }, [decodedText]);

  // useEffect(() => {
  //   fetchMejas();
  // }, []);

  return (
    <Wrapper>
      {/* <Modal isOpen={isModalOpen}>
        <div>
          <label htmlFor="Pilih Meja" className="form-label">
            Pilih Meja
          </label>
          <select
            className="form-select"
            value={selectedMeja || ""}
            onChange={handleTableSelection}
          >
            <option value="">Pilih Meja</option>
            {mejas.map((meja) => (
              <option key={meja._id} value={meja._id}>
                {meja.name || meja._id}
              </option>
            ))}
          </select>
        </div>
      </Modal> */}
      <div className="form">
        <div className="jarak" style={{ marginBottom: "2rem" }}>
          <h5>Scan QR Code Anda</h5>
          <button
            className="btn btn-secondary"
            onClick={() => window.open("/display", "_blank")}
          >
            Display Registrasi
          </button>
          {/* <button className="btn btn-secondary" onClick={handleDeleteMeja}>
            Ganti Meja
          </button> */}
        </div>
        <Container>
          <Html5QrcodePlugin
            fps={10}
            qrbox={300}
            qrCodeSuccessCallback={setDecodedText}
          />
          <div className="Result-container">
            <div className="Result-header">Hasil Scan QR Code</div>
            {showData && loadedData && (
              <div className="Result-section">
                <h5>Selamat Datang</h5>
                <h5>{loadedData.data.name}</h5>
              </div>
            )}
          </div>
        </Container>
      </div>
    </Wrapper>
  );
};

export default Scan;

// versi 2
// import { useState, useEffect } from "react";
// import Html5QrcodePlugin from "../components/Html5QrcodePlugin.jsx";
// import Wrapper from "../assets/wrappers/DashboardFormPage.js";
// import styled from "styled-components";
// import { toast } from "react-toastify";
// import customFetch from "../utils/customFetch.jsx";
// import Fail from "../assets/audio/fail1.mp3";
// import Yay from "../assets/audio/yay.mp3";
// import { socketUrl } from "../config/config.js";
// import { Html5QrcodeScanner } from "html5-qrcode";
// import Modal from "../components/Modal.jsx";

// const Container = styled.div`
//   display: flex;
//   justify-content: space-between;
//   padding: 0rem 1rem 1rem;

//   .Result-container {
//     min-width: 600px;
//     display: block;
//     margin-top: 10px;
//     margin-bottom: 10px;
//     text-align: center;
//     padding: 0rem 2rem;
//   }
//   .Result-header {
//     font-size: 16pt;
//     margin-bottom: 20px;
//   }
// `;

// export const LoadMahasiswa = async (id) => {
//   try {
//     const response = await customFetch.get(`/scan/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error("Gagal mengambil data mahasiswa:", error);
//     toast.error(error.response?.data?.msg || "Terjadi kesalahan");
//   }
// };

// export const cekRegistered = async (id) => {
//   try {
//     const response = await customFetch.get(`/scan/${id}`);
//     // console.log(response);
//     return response.data;
//   } catch (error) {
//     console.error("Gagal mengambil data :", error);
//     toast.error("QR tidak valid");
//   }
// };

// export const Register = async (id, mejaId) => {
//   if (id) {
//     try {
//       const data = await customFetch.patch(`/scan/${id}`, { mejaId });
//       toast.success("Berhasil Registrasi");
//       return data;
//     } catch (error) {
//       toast.error(error.response?.data?.msg || "Terjadi kesalahan");
//     }
//   }
// };

// const Scan = () => {
//   const [decodedResults, setDecodedResults] = useState(null);
//   const [loadedData, setLoadedData] = useState(null);
//   const [showData, setShowData] = useState(true);
//   const [selectedMeja, setSelectedMeja] = useState("");
//   const [mejas, setMeja] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(() => {
//     if (
//       localStorage.getItem("tableId") === null ||
//       localStorage.getItem("tableId") === "null"
//     ) {
//       return true;
//     } else {
//       return false;
//     }
//   });

//   useEffect(() => {
//     const meja = localStorage.getItem("tableId");
//     setSelectedMeja(meja);

//     const fetchTables = async () => {
//       try {
//         const response = await customFetch.get("settings/meja");
//         setMeja(response.data.data || []);
//       } catch (error) {
//         console.error("Gagal mengambil data meja:", error);
//         toast.error("Gagal mengambil data meja");
//       }
//     };
//     fetchTables();
//   }, []);

//   useEffect(() => {
//     if (decodedResults) {
//       cekRegistered(decodedResults).then((dataRegistered) => {
//         if (
//           dataRegistered.data.isRegis === true &&
//           dataRegistered.data.isKonsumsi === true
//         ) {
//           toast.error(
//             "Anda telah melakukan registrasi dan mengambil konsumsi!"
//           );
//           new Audio(Fail).play();
//         } else if (
//           dataRegistered.data.isRegis === true &&
//           dataRegistered.data.isKonsumsi === false
//         ) {
//           Register(decodedResults, selectedMeja).then(() => {
//             LoadMahasiswa(decodedResults).then((userRegisterData) => {
//               setLoadedData(userRegisterData);
//               setShowData(true);
//               new Audio(Yay).play();
//               setTimeout(() => {
//                 setShowData(false);
//               }, 4000);
//             });
//           });
//         } else if (dataRegistered.data.isRegis === true) {
//           toast.error("Anda telah melakukan registrasi!");
//           new Audio(Fail).play();
//         } else {
//           Register(decodedResults, selectedMeja).then(() => {
//             LoadMahasiswa(decodedResults).then((userRegisterData) => {
//               setLoadedData(userRegisterData);
//               setShowData(true);
//               new Audio(Yay).play();
//               setTimeout(() => {
//                 setShowData(false);
//               }, 4000);
//             });
//           });
//         }
//       });
//     }
//   }, [decodedResults, selectedMeja]);

//   const onNewScanResult = (decodedText) => {
//     setDecodedResults(decodedText);
//     Html5QrcodeScanner.clear();
//   };

//   const handleMejaChange = (event) => {
//     const mejaId = event.target.value;
//     localStorage.setItem("tableId", mejaId);
//     setSelectedMeja(mejaId);
//     setIsModalOpen(false);
//   };

//   const handleDeleteMeja = () => {
//     localStorage.removeItem("tableId");
//     setIsModalOpen(true);
//   };

//   const displayRegistrasi = () => {
//     const url = `${socketUrl}/display`;
//     window.open(url, "_blank");
//   };
//   // console.log(mejas);

//   return (
//     <Wrapper>
//       <Modal isOpen={isModalOpen}>
//         <div style={{ gridTemplateColumns: "1fr" }}>
//           <label htmlFor="Pilih Meja" className="form-label">
//             Pilih Meja
//           </label>
//           <select
//             name="Pilih Meja"
//             id="Pilih Meja"
//             className="form-select"
//             value={selectedMeja || ""}
//             onChange={handleMejaChange}
//           >
//             <option value="">Pilih Meja</option>
//             {mejas.length > 0 ? (
//               mejas.map((meja) => (
//                 <option key={meja._id} value={meja._id}>
//                   {meja.name || meja._id}
//                 </option>
//               ))
//             ) : (
//               <option value="">No mejas available</option>
//             )}
//           </select>
//         </div>
//       </Modal>
//       <div className="form">
//         <div className="jarak" style={{ marginBottom: "2rem" }}>
//           <h5>Scan QR Code Anda</h5>
//           <button className="btn btn-secondary" onClick={displayRegistrasi}>
//             Display Registrasi
//           </button>
//           <button className="btn btn-secondary" onClick={handleDeleteMeja}>
//             Ganti Meja
//           </button>
//         </div>
//         <Container>
//           <Html5QrcodePlugin
//             fps={10}
//             qrbox={300}
//             disableFlip={false}
//             qrCodeSuccessCallback={onNewScanResult}
//           />
//           <div className="Result-container">
//             <div className="Result-header">Hasil Scan QR Code</div>
//             {showData && loadedData && (
//               <div className="Result-section">
//                 <br />
//                 <h5>Selamat Datang</h5>
//                 <h5>{loadedData.name}</h5>
//               </div>
//             )}
//           </div>
//         </Container>
//       </div>
//     </Wrapper>
//   );
// };

// export default Scan;

//versi 1
// import { useState, useEffect } from "react";
// import Html5QrcodePlugin from "../components/Html5QrcodePlugin.jsx";
// import Wrapper from "../assets/wrappers/DashboardFormPage.js";
// import styled from "styled-components";
// import { toast } from "react-toastify";
// import customFetch from "../utils/customFetch.jsx";
// import { Html5QrcodeScanner } from "html5-qrcode";
// // import Beep from "../assets/audio/beep.mp3";
// import Fail from "../assets/audio/fail1.mp3";
// import Yay from "../assets/audio/yay.mp3";
// import { io } from "socket.io-client";
// import { socketUrl } from "../config/config.js";

// const socket = io(socketUrl, {
//   reconnection: true,
// });

// const Container = styled.div`
//   display: flex;
//   justify-content: space-between;
//   padding: 0rem 1rem 1rem;

//   .Result-container {
//     min-width: 600px;
//     display: block;
//     margin-top: 10px;
//     margin-bottom: 10px;
//     text-align: center;
//     padding: 0rem 2rem;
//   }
//   .Result-header {
//     font-size: 16pt;
//     margin-bottom: 20px;
//   }
// `;

// export const LoadMahasiswa = async (id) => {
//   try {
//     const response = await customFetch.get(`/mahasiswa/${id}`);
//     const userRegisterData = response.data.mahasiswa;
//     return userRegisterData;
//   } catch (error) {
//     console.error("Gagal mengambil data mahasiswa:", error);
//     toast.error(error.response.data.msg);
//   }
// };

// export const cekRegistered = async (id) => {
//   try {
//     const response = await customFetch.get(`/mahasiswa/sudah/${id}`);
//     const mahasiswaRegis = response.data.mahasiswa;
//     return mahasiswaRegis;
//   } catch (error) {
//     console.error("Gagal mengambil data mahasiswa:", error);
//     toast.error("QR tidak valid");
//   }
// };

// export const Register = async (id) => {
//   if (id) {
//     try {
//       const data = await customFetch.patch(`/mahasiswa/sudah/${id}`);
//       toast.success("Berhasil Registrasi");
//       socket.emit("display", data.data.mahasiswa);
//       return data;
//     } catch (error) {
//       toast.error(error.response.data.msg);
//       return error;
//     }
//   }
// };

// const Scan = () => {
//   const [decodedResults, setDecodedResults] = useState(null);
//   const [loadedData, setLoadedData] = useState(null);
//   const [showData, setShowData] = useState(true);

//   useEffect(() => {
//     if (decodedResults) {
//       cekRegistered(decodedResults).then((dataRegistered) => {
//         if (dataRegistered.isRegis === true) {
//           toast.error("Anda telah melakukan registrasi!");
//           new Audio(Fail).play();
//           console.log(dataRegistered.isRegis);
//           return;
//         } else {
//           Register(decodedResults).then(() => {
//             console.log("dataRegistered");
//             LoadMahasiswa(decodedResults).then((userRegisterData) => {
//               setLoadedData(userRegisterData);
//               setShowData(true);
//               new Audio(Yay).play();
//               setTimeout(() => {
//                 setShowData(false);
//               }, 4000);
//             });
//           });
//         }
//       });
//     }
//   }, [decodedResults]);

//   const onNewScanResult = (decodedText) => {
//     // new Audio(Beep).play();
//     setDecodedResults(decodedText);
//     Html5QrcodeScanner.clear();
//   };

//   const displayRegistrasi = () => {
//     const url = "http://localhost:5173/display";
//     window.open(url, "_blank");
//   };

//   // useEffect(() => {
//   //   // console.log("sockect io ", socket);
//   //   socket.on("display", (disshow) => {});
//   // }, []);

//   return (
//     <Wrapper>
//       <div className="form">
//         <div className="jarak" style={{marginBottom : "2rem"}}>
//           <h5>Scan QR Code Anda</h5>
//           <button className="btn btn-secondary" onClick={displayRegistrasi}>
//             Display Registrasi
//           </button>
//         </div>
//         <Container>
//           <Html5QrcodePlugin
//             fps={10}
//             qrbox={300}
//             disableFlip={false}
//             qrCodeSuccessCallback={onNewScanResult}
//           />
//           <div className="Result-container">
//             <div className="Result-header">Hasil Scan QR Code</div>
//             {showData && loadedData && (
//               <div className="Result-section">
//                 <br />
//                 <h5>Selamat Datang</h5>
//                 <h5>{loadedData.name}</h5>
//               </div>
//             )}
//           </div>
//         </Container>
//       </div>
//     </Wrapper>
//   );
// };

// export default Scan;
