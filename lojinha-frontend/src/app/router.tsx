import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layout'
import AuthRoute from './AuthRoute'
import HomePage from '../pages/HomePage'
import ProductsPage from '../pages/ProductsPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import AccountPage from '../pages/AccountPage'
import MyOrdersPage from '../pages/MyOrdersPage'
import AdminLayout from '../components/admin/AdminLayout'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminProductsPage from '../pages/admin/AdminProductsPage'
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage'
import AdminOrdersPage from '../pages/admin/AdminOrdersPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      {
        path: 'login',
        element: (
          <AuthRoute mode="guest">
            <LoginPage />
          </AuthRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <AuthRoute mode="guest">
            <RegisterPage />
          </AuthRoute>
        ),
      },
      {
        path: 'account',
        element: (
          <AuthRoute mode="protected">
            <AccountPage />
          </AuthRoute>
        ),
      },
      {
        path: 'my-orders',
        element: (
          <AuthRoute mode="protected">
            <MyOrdersPage />
          </AuthRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <AuthRoute mode="admin">
            <AdminLayout />
          </AuthRoute>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'products', element: <AdminProductsPage /> },
          { path: 'categories', element: <AdminCategoriesPage /> },
          { path: 'orders', element: <AdminOrdersPage /> },
        ],
      },
    ],
  },
])
