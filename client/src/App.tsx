import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { AdminRoute } from './components/guards/AdminRoute';

const LoginPage = () => <div>TODO: Login</div>;
const RegisterPage = () => <div>TODO: Register</div>;
const VerifyEmailPage = () => <div>TODO: Verify Email</div>;
const ForgotPasswordPage = () => <div>TODO: Forgot Password</div>;
const ResetPasswordPage = () => <div>TODO: Reset Password</div>;

const CatalogPage = () => <div>TODO: Catalog</div>;
const ApiDetailPage = () => <div>TODO: API Detail</div>;
const ProposalsPage = () => <div>TODO: My Proposals</div>;
const NewProposalPage = () => <div>TODO: New Proposal</div>;
const EditProposalPage = () => <div>TODO: Edit Proposal</div>;
const ProfilePage = () => <div>TODO: Profile</div>;

const AdminProposalsPage = () => <div>TODO: Admin Proposals</div>;
const AdminApisPage = () => <div>TODO: Admin APIs</div>;
const AdminCategoriesPage = () => <div>TODO: Admin Categories</div>;
const AdminUsersPage = () => <div>TODO: Admin Users</div>;

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/catalog" replace /> },

  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      { path: '/catalog', element: <CatalogPage /> },
      { path: '/catalog/:id', element: <ApiDetailPage /> },
      { path: '/proposals', element: <ProposalsPage /> },
      { path: '/proposals/new', element: <NewProposalPage /> },
      { path: '/proposals/:id/edit', element: <EditProposalPage /> },
      { path: '/profile', element: <ProfilePage /> },

      {
        element: <AdminRoute />,
        children: [
          { path: '/admin/proposals', element: <AdminProposalsPage /> },
          { path: '/admin/apis', element: <AdminApisPage /> },
          { path: '/admin/categories', element: <AdminCategoriesPage /> },
          { path: '/admin/users', element: <AdminUsersPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
