import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "./features/auth/store/authSlice";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;