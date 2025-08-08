import { useEffect, useState } from 'react';
import axios from 'axios';
import UserCard from "../UserCard/UserCard.jsx";
import Button from '../Button/Button.jsx'
import styles from './UsersList.module.css'
import {useNavigate} from "react-router-dom";

function UsersList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const size = 5;

    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/v1/users`, {
                params: {
                    page: page,
                    size: size,
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                setUsers(res.data.content);
                setTotalPages(res.data.totalPages);
            })
            .catch((err) => {
                console.error('Erro ao buscar usuários:', err);
            });
    }, [page]);

    const nextPage = () => {
        if (page + 1 < totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    const prevPage = () => {
        if (page > 0) {
            setPage((prev) => prev - 1);
        }
    };

    return (
        <div className={styles.usersList}>
            <ul>
                {users.map((user) => (
                    <UserCard
                        key={user.id}
                        id={user.id}
                        imgUrl={user.imgUrl}
                        userName={user.fullName}
                        email={user.username}
                    />
                ))}
            </ul>

            <div className={styles.paginationCard}>
                <button onClick={prevPage} disabled={page === 0} className={styles.paginationButtons}>Anterior</button>
                <span className={styles.pagesText}>Página {page + 1} de {totalPages}</span>
                <button onClick={nextPage} disabled={page + 1 === totalPages} className={styles.paginationButtons}>Próxima</button>
            </div>

            <Button text={"Criar Novo usuário"} action={() => navigate("register")}/>
        </div>
    );
}

export default UsersList;