import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layout'
import HomePage from '../pages/HomePage'
import ProductsPage from '../pages/ProductsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
    ],
  },
])
