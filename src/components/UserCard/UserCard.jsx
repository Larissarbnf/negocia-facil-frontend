import styles from './UserCard.module.css'
import { Edit, Trash } from "lucide-react";
import {useNavigate} from "react-router-dom";
import axios from "axios"
export default function UserCard({id, imgUrl, userName, email}) {

    const navigate = useNavigate();

    async function confirmDelete() {
        const confirm = window.confirm(`Tem certeza que deseja excluir o usuário ${userName}?`);
        if (!confirm) return;

        const token = localStorage.getItem("token");
        try {
            await axios.delete(`http://localhost:8080/api/v1/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert("Usuário excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            alert("Erro ao excluir o usuário.");
        }
    }

    return (
        <div className={styles.userCard}>
            <div className={styles.userInfo}>
                <img src={imgUrl || "https://conteudo.imguol.com.br/blogs/174/files/2018/05/iStock-648229868-1024x909.jpg"} alt={`Profile photo of ${userName}`} width={50} height={50}/>
                <div className={styles.userNameAndEmailCard}>
                    <span>{userName}</span>
                    <span>{email}</span>
                </div>
            </div>
            <div className={styles.buttonsCard}>
                <button onClick={() => navigate(`/admin/users/${id}`)} className={styles.editButton}>
                    <Edit size={20}/>
                </button>
                <button onClick={confirmDelete} className={styles.deleteButton} >
                    <Trash size={20}/>
                </button>
            </div>
        </div>


    )
}
