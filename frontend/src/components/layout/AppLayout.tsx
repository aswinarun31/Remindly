
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";


const AppLayout = () => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-hidden p-4 lg:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
