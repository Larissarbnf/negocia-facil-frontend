import { useState, useRef } from 'react';
import styles from './PhotoUpload.module.css';

const PhotoUpload = ({ currentPhoto, onPhotoUpdate, userId }) => {
  const [preview, setPreview] = useState(currentPhoto);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Apenas arquivos JPG, PNG ou WEBP são permitidos');
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload
    await uploadPhoto(file);
  };

  const uploadPhoto = async (file) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Nota: Usando estado ao invés de localStorage para compatibilidade
      const token = obterTokenAuth(); // Você precisará implementar esta função
      const response = await fetch(`/api/v1/users/${userId}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setPreview(data.avatarUrl);
        onPhotoUpdate?.(data.avatarUrl);
        alert('Foto atualizada com sucesso!');
      } else {
        throw new Error('Erro ao fazer upload');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da foto');
      setPreview(currentPhoto); // Voltar para foto anterior
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!confirm('Deseja remover a foto de perfil?')) return;

    try {
      const token = obterTokenAuth(); // Você precisará implementar esta função
      const response = await fetch(`/api/v1/users/${userId}/avatar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPreview(null);
        onPhotoUpdate?.(null);
        alert('Foto removida com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      alert('Erro ao remover foto');
    }
  };

  // Função auxiliar - implemente baseado no seu sistema de autenticação
  const obterTokenAuth = () => {
    // Substitua localStorage pela sua solução de gerenciamento de estado
    // Por exemplo, do React context, Redux, ou props
    return 'seu-token-de-auth-aqui';
  };

  return (
    <div className={styles.photoUploadContainer}>
      <div className={styles.photoPreview}>
        {preview ? (
          <img 
            src={preview} 
            alt="Foto do usuário" 
            className={styles.profilePhoto}
          />
        ) : (
          <div className={styles.photoPlaceholder}>
            <span className={styles.placeholderIcon}>👤</span>
            <span className={styles.placeholderText}>Sem foto</span>
          </div>
        )}
        
        {uploading && (
          <div className={styles.uploadOverlay}>
            <div className={styles.loadingSpinner}></div>
            <span>Enviando...</span>
          </div>
        )}
      </div>

      <div className={styles.photoActions}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={styles.uploadBtn}
        >
          📸 {preview ? 'Alterar Foto' : 'Adicionar Foto'}
        </button>
        
        {preview && (
          <button
            onClick={removePhoto}
            disabled={uploading}
            className={styles.removeBtn}
          >
            🗑️ Remover Foto
          </button>
        )}
      </div>

      <div className={styles.uploadInfo}>
        <small>
          Formatos: JPG, PNG, WEBP • Tamanho máximo: 5MB
        </small>
      </div>
    </div>
  );
};

export default PhotoUpload;