import {createBrowserRouter, RouterProvider, Navigate} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import {ProtectedRoute} from './components/guards/ProtectedRoute';
import {AdminRoute} from './components/guards/AdminRoute';

import {LoginPage} from './pages/auth/LoginPage';
import {RegisterPage} from './pages/auth/RegisterPage';
import {VerifyEmailPage} from './pages/auth/VerifyEmailPage';
import {ForgotPasswordPage} from './pages/auth/ForgotPasswordPage';
import {ResetPasswordPage} from './pages/auth/ResetPasswordPage';

import {CatalogPage} from './pages/catalog/CatalogPage';
import {ApiDetailPage} from './pages/catalog/ApiDetailPage';
import {ProposalsPage} from './pages/proposals/ProposalsPage';
import {ProposalFormPage} from './pages/proposals/ProposalFormPage';

import {ProfilePage} from './pages/ProfilePage';

import {AdminProposalsPage} from './pages/admin/AdminProposalsPage';
import {AdminApisPage} from './pages/admin/AdminApisPage';
import {AdminApiFormPage} from './pages/admin/AdminApiFormPage';
import {AdminCategoriesPage} from './pages/admin/AdminCategoriesPage';

import {AdminUsersPage} from './pages/admin/AdminUsersPage';

const router = createBrowserRouter([
    {path: '/', element: <Navigate to="/catalog" replace/>},

    {path: '/login', element: <LoginPage/>},
    {path: '/register', element: <RegisterPage/>},
    {path: '/verify-email', element: <VerifyEmailPage/>},
    {path: '/forgot-password', element: <ForgotPasswordPage/>},
    {path: '/reset-password', element: <ResetPasswordPage/>},

    {
        element: <ProtectedRoute/>,
        children: [
            {path: '/catalog', element: <CatalogPage/>},
            {path: '/catalog/:id', element: <ApiDetailPage/>},
            {path: '/proposals', element: <ProposalsPage/>},
            {path: '/proposals/new', element: <ProposalFormPage/>},
            {path: '/proposals/:id/edit', element: <ProposalFormPage/>},
            {path: '/profile', element: <ProfilePage/>},

            {
                element: <AdminRoute/>,
                children: [
                    {path: '/admin/proposals', element: <AdminProposalsPage/>},
                    {path: '/admin/apis', element: <AdminApisPage/>},
                    {path: '/admin/apis/new', element: <AdminApiFormPage/>},
                    {path: '/admin/apis/:id/edit', element: <AdminApiFormPage/>},
                    {path: '/admin/categories', element: <AdminCategoriesPage/>},
                    {path: '/admin/users', element: <AdminUsersPage/>},
                ],
            },
        ],
    },
]);

function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router}/>
        </AuthProvider>
    );
}

export default App;
