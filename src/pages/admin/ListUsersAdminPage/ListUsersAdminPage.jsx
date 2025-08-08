import styles from "./ListUsersAdminPage.module.css"
import UsersList from "../../../components/UsersList/UsersList.jsx";
import SearchBar from "../../../components/SearchBar/SearchBar.jsx";
function ListUsersAdminPage(){
    return (
        <div className={styles.mainContent}>
            <SearchBar/>
            <UsersList/>
        </div>
    )
}
export default ListUsersAdminPage