import { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"

const ShopContext = createContext(null)
const CART_STORAGE_KEY = "shopping-cart-items"

function clampQuantity(quantity, stock) {
  const safeQuantity = Number.isFinite(quantity) ? quantity : 1
  const maxQuantity = typeof stock === "number" ? Math.max(stock, 0) : Number.POSITIVE_INFINITY
  return Math.min(Math.max(safeQuantity, 1), maxQuantity)
}

export function ShopProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)
    return storedCart ? JSON.parse(storedCart) : []
  })

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/products")
        setProducts(response.data)
        setError("")
      } catch (fetchError) {
        setError("Unable to load products right now.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const addToCart = (product, quantity = 1) => {
    if (typeof product.stock === "number" && product.stock < 1) {
      return
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item._id === product._id)

      if (existingItem) {
        return currentItems.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: clampQuantity(item.quantity + quantity, product.stock)
              }
            : item
        )
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: clampQuantity(quantity, product.stock)
        }
      ]
    })
  }

  const updateQuantity = (productId, quantity) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item._id !== productId) {
            return item
          }

          return {
            ...item,
            quantity: clampQuantity(quantity, item.stock)
          }
        })
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item._id !== productId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <ShopContext.Provider
      value={{
        products,
        loading,
        error,
        cartItems,
        subtotal,
        totalItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  const context = useContext(ShopContext)

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider")
  }

  return context
}
