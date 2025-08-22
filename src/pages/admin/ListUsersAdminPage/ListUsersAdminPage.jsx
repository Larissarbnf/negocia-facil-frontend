import { useState, useEffect } from "react";
import styles from "./ListUsersAdminPage.module.css";
import UsersList from "../../../components/UsersList/UsersList.jsx";
import SearchBar from "../../../components/SearchBar/SearchBar.jsx";

function ListUsersAdminPage() {
    const [usersCount, setUsersCount] = useState(0);
    const [loading, setLoading] = useState(true);

 
    return (
        <div className={styles.listUsersAdminPage}>
            <div className={styles.mainContent}>
                {/* Header da página */}
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>
                        Gerenciar Usuários
                    </h1>
                    
                </div>

                {/* Container de busca */}
                <div className={styles.searchContainer}>
                    <SearchBar />
                </div>

                {/* Container da lista */}
                <div className={styles.listContainer}>
                    <UsersList />
                </div>
            </div>
        </div>
    );
}

export default ListUsersAdminPage;