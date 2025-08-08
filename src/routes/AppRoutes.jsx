import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Páginas de autenticação
import Login from "../pages/Auth/Login/Login.jsx";
import Register from "../pages/Auth/Register/Register.jsx";

// Páginas do administrador
import EditUsersAdminPage from "../pages/admin/EditUsersAdminPage/EditUsersAdminPage.jsx";
import ListUsersAdminPage from "../pages/admin/ListUsersAdminPage/ListUsersAdminPage.jsx";
import CreateUsersAdminPage from "../pages/admin/CreateUsersAdminPage/CreateUsersAdminPage.jsx";
import AdminHomePage from "../pages/admin/AdminHomePage/AdminHomePage.jsx";

// Outras páginas
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage.jsx";
import Home from "../pages/Home.jsx";
import AdvertisementsPage from "../pages/AdvertisementsPage.jsx";
import { AdvertisementFormPage } from "../pages/AdvertisementFormPage.jsx";
import ProductsPage from "../pages/ProductsPage.jsx";

// Páginas de regras
import RuleList from "../pages/RuleList";
import RuleForm from "../pages/RuleForm";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirecionamento inicial */}
                <Route path="/" element={<Navigate to="/auth/login" replace />} />

                {/* Rotas de autenticação */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />

                {/* Rotas do admin */}
                <Route path="/admin" element={<AdminHomePage />}>
                    <Route path="users" element={<ListUsersAdminPage />} />
                    <Route path="users/:id" element={<EditUsersAdminPage />} />
                    <Route path="users/register" element={<CreateUsersAdminPage />} />
                </Route>

                {/* Rotas principais */}
                <Route path="/home" element={<Home />} />
                <Route path="/products" element={<ProductsPage />} />

                {/* Rotas de anúncios - ESTRUTURA CORRIGIDA */}
                <Route path="/advertisements" element={<AdvertisementsPage />} />
                <Route path="/advertisements/new" element={<AdvertisementFormPage />} />
                <Route path="/advertisements/:id" element={<AdvertisementFormPage />} />
                
                {/* Rota alternativa para compatibilidade com sistema existente */}
                <Route path="/edit/:id" element={<AdvertisementFormPage />} />

                {/* Rotas para regras */}
                <Route path="/rules" element={<RuleList />} />
                <Route path="/rules/new" element={<RuleForm />} />
                <Route path="/rules/edit/:id" element={<RuleForm />} />

                {/* Página 404 - deve ser sempre a última rota */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}