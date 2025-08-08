import styles from './UserForm.module.css'
import Button from "../Button/Button.jsx"
import {ErrorBoundary} from "react-error-boundary";
import {useNavigate} from "react-router-dom";

function UserForm({action}){
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            action(data);
            navigate("/admin/users");
        } catch (err) {
            alert("Erro ao cadastrar usuário:", err);
        }
    }

    return (
        <ErrorBoundary fallback={<p>There was an error while submitting the form</p>}>
            <form className={styles.form} onSubmit={handleSubmit} >
                <input name="fullName" placeholder={"Nome Completo"} type={"text"} required={true}/>
                <input name="username" placeholder={"Email"} type={"email"} required={true}/>
                <input name="enrollmentNumber" placeholder={"Matrícula"} type={"text"} required={true}/>
                <input name="password" placeholder={"Senha"} type={"password"} required={true}/>
                <Button text={"Cadastrar Novo Usuário"} type="submit"/>
                <Button text="Cancelar" action={() => {navigate("/admin/users")}}/>
            </form>
        </ErrorBoundary>
    )
}
export default UserForm