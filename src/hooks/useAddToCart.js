import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTemporaryFlag } from './useTemporaryFlag.js'

// Encapsulates the "add to cart" flow shared by the product card and the
// product detail page: redirect to sign-in when signed out, otherwise add and
// show a transient "added" confirmation.
export function useAddToCart(product) {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [added, flash] = useTemporaryFlag()

  function add(quantity = 1) {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${product.id}` } } })
      return
    }
    addToCart(product, quantity)
    flash()
  }

  return { added, add }
}
