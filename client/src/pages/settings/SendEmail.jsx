import { useSettingsContext } from "../../pages/settings/SettingsContext";

const SendEmail = () => {
  const { settings } = useSettingsContext();
  const { Email } = settings;
  return <>{Email && <div>doajdjas</div>}</>;
};
export default SendEmail;
