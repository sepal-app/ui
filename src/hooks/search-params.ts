import { useLocation } from "react-router-dom";

function useSearchParams() {
  const location = useLocation();
  return new URLSearchParams(location.search);
}

export default useSearchParams;
