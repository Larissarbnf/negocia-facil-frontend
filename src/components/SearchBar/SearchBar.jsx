import styles from './SearchBar.module.css'
import {Search} from 'lucide-react'
import {useState} from "react";

function SearchBar(){

    const [searchTerm, setSearchTerm] = useState('');

    function handleInputChange(event) {
        setSearchTerm(event.target.value);
        console.log('Text typed:', event.target.value);
    }

    return (
        <div className={styles.searchBarContainer}>
            <Search size={20} color={"#333"}/>
            <input type="search" placeholder={"Buscar..."} value={searchTerm} onChange={handleInputChange}/>
        </div>
    )
}
export default SearchBar