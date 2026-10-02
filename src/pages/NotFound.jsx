import { Link } from "react-router-dom";
import { useTitle } from "../lib/useTitle";

export function NotFound() {
  useTitle("Not found");
  return (
    <div className="wrap empty">
      <h1>That page isn’t on the shelf.</h1>
      <Link to="/" className="btn">
        Back home
      </Link>
    </div>
  );
}
