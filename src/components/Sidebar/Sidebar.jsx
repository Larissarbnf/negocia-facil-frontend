import {Home, Package, Tag, Shield, LogOut, Users} from "lucide-react";
import SidebarHeader from "./SidebarHeader/SidebarHeader.jsx";
import styles from './Sidebar.module.css'
import {NavLink} from "react-router-dom";
function Sidebar(){

    const menuItems = [
        { icon: <Home size={20} />, label: "Início", path: "/AnunciosDetalhes"  },
        { icon: <Package size={20} />, label: "Produtos", path: "/products"  }, // AQUIII ATENÇÂO
        { icon: <Tag size={20} />, label: "Anúncios", path: "/advertisements" },
        { icon: <Shield size={20} />, label: "Regras", path: "/rules"   }, // AQUIII ATENÇÂO
        { icon: <Users size={20} />, label: "Usuários", path: "/admin/users" }
    ];


    return (
        <aside className={styles.aside}>
            <SidebarHeader imgUrl={"https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Riley"} userName={"Larissa Farias"}/>
            <nav className={styles.nav}>
                {
                    menuItems.map((item, index) =>
                        (
                            <NavLink className={styles.link} key={index} to={item.path}>
                                <span className={styles.svgImage}>{item.icon}</span>
                                <span className={styles.text}>{item.label}</span>
                            </NavLink>
                        )
                    )
                }
            </nav>
            <NavLink className={styles.link} to={"/auth/login"}><LogOut className={styles.svgImage} size={20}/> <span className={styles.text}>Sair</span></NavLink>
        </aside>
    )
}
export default Sidebar