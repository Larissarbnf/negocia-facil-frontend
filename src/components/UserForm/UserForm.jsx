import React, { useState, useEffect } from 'react';
import styles from './UserForm.module.css';

// Componente Button limpo
const Button = ({ text, type = "button", action, variant = "primary" }) => {
  const buttonClass = `${styles.button} ${styles[variant]}`;
  
  return (
    <button
      type={type}
      onClick={action}
      className={buttonClass}
    >
      {text}
    </button>
  );
};

// Componente ErrorBoundary simples
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function UserForm({ 
  action = () => {}, 
  initialData = null, 
  onCancel = () => {}, 
  isEditing = false 
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    enrollmentNumber: '',
    password: '',
    whatsappNumber: ''
  });

  // useEffect para carregar os dados iniciais quando estiver editando
  useEffect(() => {
    if (isEditing && initialData) {
      console.log("Carregando dados iniciais:", initialData); // Para debug
      setFormData({
        fullName: initialData.fullName || '',
        username: initialData.username || '',
        enrollmentNumber: initialData.enrollmentNumber || '',
        password: '', // Senha sempre vazia por segurança
        whatsappNumber: initialData.whatsappNumber || ''
      });
    } else if (!isEditing) {
      // Limpar formulário quando não estiver editando
      setFormData({
        fullName: '',
        username: '',
        enrollmentNumber: '',
        password: '',
        whatsappNumber: ''
      });
    }
  }, [isEditing, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validações básicas
    if (!formData.fullName.trim()) {
      alert('Nome completo é obrigatório');
      return;
    }
    if (!formData.username.trim()) {
      alert('Email é obrigatório');
      return;
    }
    if (!formData.enrollmentNumber.trim()) {
      alert('Matrícula é obrigatória');
      return;
    }
    if (!isEditing && !formData.password.trim()) {
      alert('Senha é obrigatória para novos usuários');
      return;
    }

    try {
      // Preparar dados para envio
      const dataToSend = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        enrollmentNumber: formData.enrollmentNumber.trim(),
        whatsappNumber: formData.whatsappNumber.trim() || null
      };
      
      // Adicionar senha apenas se não estiver vazia
      if (formData.password && formData.password.trim()) {
        dataToSend.password = formData.password.trim();
      }

      console.log("Dados sendo enviados:", dataToSend); // Para debug
      action(dataToSend);
    } catch (err) {
      console.error("Erro no handleSubmit:", err);
      alert("Erro ao salvar usuário: " + err.message);
    }
  };

  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    } else {
      // Fallback se onCancel não for passado
      setFormData({
        fullName: '',
        username: '',
        enrollmentNumber: '',
        password: '',
        whatsappNumber: ''
      });
      alert('Formulário cancelado');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditing ? 'Editar Usuário' : 'Cadastrar Usuário'}
          </h2>
          <p className={styles.subtitle}>
            {isEditing ? 
              'Altere os dados do usuário conforme necessário' : 
              'Preencha os dados para criar um novo usuário'
            }
          </p>
        </div>

        {/* Form Card */}
        <div className={styles.card}>
          <ErrorBoundary fallback={
            <div className={styles.errorMessage}>
              <p>Ocorreu um erro ao enviar o formulário</p>
            </div>
          }>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldsContainer}>
                {/* Nome Completo */}
                <div className={styles.field}>
                  <label htmlFor="fullName" className={styles.label}>
                    Nome Completo
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Digite o nome completo"
                  />
                </div>

                {/* Email */}
                <div className={styles.field}>
                  <label htmlFor="username" className={styles.label}>
                    Email
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="email"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Digite o email"
                  />
                </div>

                {/* Matrícula */}
                <div className={styles.field}>
                  <label htmlFor="enrollmentNumber" className={styles.label}>
                    Matrícula
                  </label>
                  <input
                    id="enrollmentNumber"
                    name="enrollmentNumber"
                    type="text"
                    required
                    value={formData.enrollmentNumber}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Digite a matrícula"
                  />
                </div>

                {/* WhatsApp */}
                <div className={styles.field}>
                  <label htmlFor="whatsappNumber" className={styles.label}>
                    WhatsApp (opcional)
                  </label>
                  <input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Digite o número do WhatsApp"
                  />
                </div>

                {/* Senha */}
                <div className={styles.field}>
                  <label htmlFor="password" className={styles.label}>
                    Senha {isEditing && '(deixe vazio para manter a atual)'}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required={!isEditing}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder={isEditing ? "Digite nova senha (opcional)" : "Digite a senha"}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className={styles.buttonContainer}>
                <Button 
                  text={isEditing ? "Salvar Alterações" : "Cadastrar Usuário"} 
                  type="submit" 
                  variant="primary"
                />
                <Button 
                  text="Cancelar" 
                  type="button"
                  variant="secondary"
                  action={handleCancel}
                />
              </div>
            </form>
          </ErrorBoundary>
        </div>

        {/* Footer info */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            {isEditing ? 
              'Campos obrigatórios: Nome, Email e Matrícula' :
              'Todos os campos são obrigatórios'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserForm;