import TabelContainer from "../../assets/wrappers/Tabel";
import Meja from "./Meja";
import ActivationFeatures from "./ActivationFeature";
import UserSettings from "./UserSettings";
import SendEmail from "./SendEmail";

const Settings = () => {
  return (
    <TabelContainer>
      <UserSettings />
      <hr />
      <ActivationFeatures />
      <hr />
      <Meja />
      <hr />
      <SendEmail />
    </TabelContainer>
  );
};

export default Settings;
