import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../../components/Sidebar/Sidebar.jsx";
import EditUserForm from "../../../components/EditUserForm/EditUserForm.jsx";
import styles from "./EditUsersAdminPage.module.css";
import { useParams } from "react-router-dom";

function EditUsersAdminPage() {
    const [userData, setUserData] = useState(null);
    const {id} = useParams();

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await axios.get(`http://localhost:8080/api/v1/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                console.log(res.data)
                setUserData(res.data);
            } catch (err) {
                console.error("Erro ao buscar usuário:", err);
            }
        }
        fetchUser();
    }, [id]);

    async function handleEditUser(data) {
        const formattedData = {
            username: data.username,
            password: data.password,
            fullName: data.fullName,
            enrollmentNumber: data.enrollmentNumber
        };

        try {
            await axios.put(`http://localhost:8080/api/v1/users/${data.id}`, formattedData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            alert("Usuário editado com sucesso!");
        } catch (error) {
            console.error("Erro ao editar usuário:", error.response?.data || error.message || error);
            alert("Erro ao editar o usuário.");
        }
    }

    return (
        <div className={styles.mainContent}>
            <div className={styles.formHeader}>
                <h2>Formulário de edição</h2>
            </div>
            {userData ? <EditUserForm user={userData} action={handleEditUser} /> : <p>Carregando...</p>}
        </div>
    );
}
export default EditUsersAdminPage;