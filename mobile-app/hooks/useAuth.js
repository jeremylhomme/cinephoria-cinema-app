import { useSelector } from "react-redux";

const useAuth = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  return { userInfo };
};

export default useAuth;
