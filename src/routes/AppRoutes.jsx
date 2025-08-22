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
import ProductsPage from "../pages/ProductsPage.jsx";

// Páginas de anúncios
import AdvertisementsPage from "../pages/AdvertisementsPage.jsx";
import CriarAnuncio from "../pages/CriarAnuncio.jsx";
import { AdvertisementFormPage } from "../pages/AdvertisementFormPage.jsx";
import AdvertisementEditPage from "../pages/AdvertisementEditPage.jsx";


// Página de detalhes dos anúncios
import AnunciosDetalhes from "../pages/AnunciosDetalhes.jsx";

// Páginas de regras
import RuleList from "../pages/RuleList";
import RuleForm from "../pages/RuleForm";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirecionamento inicial - mantém AnunciosDetalhes */}
                <Route path="/" element={<Navigate to="/AnunciosDetalhes" replace />} />

                {/* Rotas de autenticação */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />

                {/* 🎯 ROTA DE DEBUG - TESTE ISOLADO */}
                <Route path="/debug-create-users" element={<CreateUsersAdminPage />} />

                {/* Rotas do admin */}
                <Route path="/admin" element={<AdminHomePage />}>
                    <Route path="users" element={<ListUsersAdminPage />} />
                    <Route path="users/:id" element={<EditUsersAdminPage />} />
                    <Route path="users/register" element={<CreateUsersAdminPage />} />
                </Route>

                {/* Rotas principais */}
                <Route path="/home" element={<Home />} />
                <Route path="/products" element={<ProductsPage />} />

                {/* ROTAS DE ANÚNCIOS - ORDEM CORRETA: ESPECÍFICAS PRIMEIRO */}
                
                {/* Rota para criar novo anúncio - DEVE VIR PRIMEIRO */}
                <Route path="/advertisements/new" element={<AdvertisementFormPage />} />
                
                {/* Rotas para editar anúncio - ESPECÍFICA */}
                <Route path="/advertisements/edit/:id" element={<AdvertisementEditPage />} />
                
                {/* Rotas para detalhes do anúncio */}
                <Route path="/advertisements/detalhes/:id" element={<AnunciosDetalhes />} />
                <Route path="/advertisements/details/:id" element={<AnunciosDetalhes />} />
                <Route path="/AnunciosDetalhes/:id" element={<AnunciosDetalhes />} />
                <Route path="/AnunciosDetalhes" element={<AnunciosDetalhes />} />
                
                {/* Rota principal para CriarAnuncio (gerenciamento) */}
                <Route path="/CriarAnuncio" element={<CriarAnuncio />} />
                
                {/* Rota para listar todos os anúncios */}
                <Route path="/advertisements" element={<AdvertisementsPage />} />

                {/* Rota genérica para visualizar anúncio (FALLBACK - deve vir por último) */}
                <Route path="/advertisements/:id" element={<AnunciosDetalhes />} />

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