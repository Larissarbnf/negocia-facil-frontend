import styles from './Button.module.css'
function Button({ text, action, type = "button", disabled = false }) {
    return (
        <button className={styles.createUserButton}
                onClick={action}
                type={type}
                disabled={disabled}
        >{text}</button>
    )
}
export default Button