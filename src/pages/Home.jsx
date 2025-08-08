import Sidebar from "../components/Sidebar/Sidebar.jsx"
import SearchBar from "../components/SearchBar/SearchBar.jsx";
import UsersList from "../components/UsersList/UsersList.jsx";
import Button from '../components/Button/Button.jsx'
function Home(){
    return (
        <>
            <Sidebar/>
            <SearchBar/>
            <UsersList/>
            <Button text={"Criar Novo Usuário"} action={alert("Button create user clicked!")}/>
        </>
    )
}
export default Home