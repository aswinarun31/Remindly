
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";


const AppLayout = () => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
