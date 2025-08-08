import { Outlet } from "react-router";
import SidebarLayout from "../../../layouts/admin/SidebarLayout/SidebarLayout.jsx";
export default function AdminHomePage() {
    return (
        <SidebarLayout>
            <Outlet/>
        </SidebarLayout>
    )
}