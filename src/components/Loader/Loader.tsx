import { Oval } from "react-loader-spinner";
import css from "./Loader.module.css";

export default function Loader() {
  return (
    <div className={css.wrapper} role="status">
      <Oval height={60} width={60} color="#374f42" secondaryColor="#d1e0d8" strokeWidth={4} />
    </div>
  );
}
