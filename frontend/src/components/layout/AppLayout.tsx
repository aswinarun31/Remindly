import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="
        flex-1
        mx-auto
        w-full
        max-w-7xl
        px-4
        py-6
        overflow-y-hidden
      ">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout