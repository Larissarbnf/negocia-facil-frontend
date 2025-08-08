import styles from './EditUserForm.module.css'
import Button from "../Button/Button.jsx"
import {useState, useEffect} from "react";
import { ErrorBoundary } from "react-error-boundary"
import {useNavigate} from "react-router-dom";

export default function EditUserForm({ user, action }) {

    const navigate = useNavigate();

    const [formState, setFormState] = useState({
        fullName: user?.fullName || "",
        username: user?.username || "",
        enrollmentNumber: user?.enrollmentNumber || "",
        password: "",
    });

    useEffect(() => {
        setFormState({
            fullName: user?.fullName || "",
            username: user?.username || "",
            enrollmentNumber: user?.enrollmentNumber || "",
            password: "",
        });
    }, [user]);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        const data = { ...formState, id: user.id };
        action(data);
    }

    return (
        <ErrorBoundary>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input name="fullName" value={formState.fullName} onChange={handleChange} required />
                <input name="username" value={formState.username} onChange={handleChange} required />
                <input name="enrollmentNumber" value={formState.enrollmentNumber} onChange={handleChange} required />
                <input name="password" value={formState.password} onChange={handleChange} placeholder="Senha" type="password" required />
                <Button text="Salvar Alterações" type={"submit"}/>
                <Button text="Cancelar" action={() => {navigate("/admin/users")}}/>
            </form>
        </ErrorBoundary>
    );
}
