import { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import { socketUrl } from "../config/config";
import { pusher } from "../utils/pusherUtils";
import Wrapper from "../assets/wrappers/Display";
import bgDisplay from "../assets/images/bgDisplay.png";
import VectorLeft from "../assets/images/VectorLeft.png";
import VectorRight from "../assets/images/VectorRight.png";

// const socket = io(socketUrl, {
//   reconnection: true,
// });

// client-side
// socket.on("connect", () => {
//   console.log(socket.id);
//   console.log(socket.connected);
//   console.log("-------------");
// });

const Display = () => {
  const [showDisplay, setShowDisplay] = useState(false);
  const [dataScan, setDataScan] = useState(null);
  const [registrasionGate, setRegistrasionGate] = useState(null);

  useEffect(() => {
    const registrastionGateId = localStorage.getItem("tableId");
    if (registrastionGateId) {
      setRegistrasionGate(registrastionGateId);
    }

    const channel = pusher.subscribe(registrastionGateId);
    channel.bind("my-event", (data) => {
      setDataScan(data);
      setShowDisplay(true);
      setTimeout(() => {
        setShowDisplay(false);
      }, 6000);

      console.log(data);
    });

    // const handleDisplay = (hasil) => {
    //   console.log(hasil);

    //   setDataScan(hasil);
    //   setShowDisplay(true);
    //   setTimeout(() => {
    //     setShowDisplay(false);
    //   }, 4000);
    // };

    // socket.on("display", handleDisplay);

    // return () => {
    //   socket.off("display", handleDisplay);
    // };
  }, [registrasionGate]);

  // console.log(dataScan);
  const formatName = (name) => {
    const words = name.split(" ");
    if (words.length > 2) {
      return (
        <>
          {words.slice(0, 2).join(" ")}
          <br />
          {words.slice(2).join(" ")}
        </>
      );
    }
    return name;
  };
  return (
    <Wrapper>
      <img src={bgDisplay} alt="background display" className="image" />
      <div className="overlay-text">
        <h2>congraduation</h2>
        <div className="container">
          <img src={VectorLeft} className="left-vector" alt="Left Vector" />
          <h1>Selamat Datang</h1>
          <img src={VectorRight} className="right-vector" alt="Right Vector" />
        </div>
        {showDisplay && dataScan && (
          <>
          <p className="displayName">Orang Tua</p>
          <p className="displayName">{formatName(dataScan.data.name)}</p>
          <br />
          <p className="displayName">No Kursi anda : {dataScan.data?.noKursi}</p>
          </>
        )}
        {/* <p className="displayName">Dharma Putra Prataam</p> */}
      </div>
    </Wrapper>
  );
};

export default Display;
