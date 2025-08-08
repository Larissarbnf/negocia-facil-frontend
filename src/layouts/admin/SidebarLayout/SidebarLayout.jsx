import styles from "./SidebarLayout.module.css"
import Sidebar from "../../../components/Sidebar/Sidebar.jsx"

export default function SidebarLayout({children}){
    return (
        <div className={styles.layout}>
            <Sidebar/>
            <main>
                {children}
            </main>
        </div>
    )
}