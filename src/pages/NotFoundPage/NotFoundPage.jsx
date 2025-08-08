import styles from "./NotFoundPage.module.css"
import { Link } from "react-router-dom";
export default function NotFoundPage(){
    return (
        <div className={styles.container}>
            <img
                src={"https://media.giphy.com/media/A9EcBzd6t8DZe/giphy.gif"}
                alt={"Gif engraçado de erro"}
                className={styles.image}
            />
            <h1 className={styles.title}>404 - Página não encontrada</h1>
            <p className={styles.message}>
                A página que você está tentando acessar não existe ou foi movida.
            </p>
            <Link to="/" className={styles.link}>
                Voltar para a página inicial
            </Link>
        </div>
    )
}