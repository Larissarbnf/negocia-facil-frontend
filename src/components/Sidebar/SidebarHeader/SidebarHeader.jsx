import styles from './SidebarHeader.module.css'
function SidebarHeader({imgUrl, userName}){
    return (
        <div className={styles.sidebarHeader}>
            <img src={imgUrl} width={100} height={100} alt={`user: ${userName}`}/>
            <span>{userName}</span>
        </div>
    )
}
export default SidebarHeader