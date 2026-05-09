import { Outlet } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'

export default function RootLayout() {
  return (
    <CartProvider>
      <Outlet />
    </CartProvider>
  )
}
