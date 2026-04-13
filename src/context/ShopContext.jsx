import { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"

const ShopContext = createContext(null)
const CART_STORAGE_KEY = "shopping-cart-items"
const AUTH_STORAGE_KEY = "ozone-auth-session"
const PRODUCT_IMAGE_MAP = {
  "Mechanical Keyboard":
    "https://images.pexels.com/photos/27791751/pexels-photo-27791751.jpeg?cs=srgb&dl=pexels-jethro-c-703137695-27791751.jpg&fm=jpg",
  "Wireless Mouse":
    "https://images.pexels.com/photos/15601241/pexels-photo-15601241.jpeg?cs=srgb&dl=pexels-alphaen-15601241.jpg&fm=jpg",
  "Studio Headphones":
    "https://images.pexels.com/photos/30428605/pexels-photo-30428605.jpeg?cs=srgb&dl=pexels-anchukk-30428605.jpg&fm=jpg",
  "27-inch Monitor":
    "https://images.pexels.com/photos/21325139/pexels-photo-21325139.jpeg?cs=srgb&dl=pexels-alphaen-21325139.jpg&fm=jpg",
  "Portable Speaker":
    "https://images.pexels.com/photos/11103381/pexels-photo-11103381.jpeg?cs=srgb&dl=pexels-towfiqu-barbhuiya-3440682-11103381.jpg&fm=jpg",
  "HD Webcam":
    "https://images.pexels.com/photos/31726723/pexels-photo-31726723.jpeg?cs=srgb&dl=pexels-alpha-en-31726723.jpg&fm=jpg"
}

function resolveProductImage(product) {
  if (!product) {
    return ""
  }

  if (typeof product.image === "string" && product.image.length > 0 && !product.image.startsWith("data:image/svg+xml")) {
    return product.image
  }

  return PRODUCT_IMAGE_MAP[product.name] || PRODUCT_IMAGE_MAP["Mechanical Keyboard"]
}

const FALLBACK_PRODUCTS = [
  {
    _id: "keyboard-01",
    name: "Mechanical Keyboard",
    description: "Compact hot-swappable keyboard with tactile switches and white backlight.",
    price: 6499,
    stock: 14,
    image: PRODUCT_IMAGE_MAP["Mechanical Keyboard"]
  },
  {
    _id: "mouse-01",
    name: "Wireless Mouse",
    description: "Ergonomic precision mouse with silent clicks and USB-C charging.",
    price: 2499,
    stock: 20,
    image: PRODUCT_IMAGE_MAP["Wireless Mouse"]
  },
  {
    _id: "headphones-01",
    name: "Studio Headphones",
    description: "Over-ear headphones with balanced sound, soft cushions, and foldable design.",
    price: 8999,
    stock: 8,
    image: PRODUCT_IMAGE_MAP["Studio Headphones"]
  },
  {
    _id: "monitor-01",
    name: "27-inch Monitor",
    description: "QHD display with slim bezels, 100Hz refresh rate, and HDMI connectivity.",
    price: 22999,
    stock: 6,
    image: PRODUCT_IMAGE_MAP["27-inch Monitor"]
  },
  {
    _id: "speaker-01",
    name: "Portable Speaker",
    description: "Room-filling wireless speaker with deep bass and all-day battery life.",
    price: 4299,
    stock: 11,
    image: PRODUCT_IMAGE_MAP["Portable Speaker"]
  },
  {
    _id: "webcam-01",
    name: "HD Webcam",
    description: "1080p webcam with low-light correction and dual noise-reduction microphones.",
    price: 3199,
    stock: 17,
    image: PRODUCT_IMAGE_MAP["HD Webcam"]
  }
]

function clampQuantity(quantity, stock) {
  const safeQuantity = Number.isFinite(quantity) ? quantity : 1
  const maxQuantity = typeof stock === "number" ? Math.max(stock, 0) : Number.POSITIVE_INFINITY
  return Math.min(Math.max(safeQuantity, 1), maxQuantity)
}

export function ShopProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const storedSession = localStorage.getItem(AUTH_STORAGE_KEY)
    return storedSession ? JSON.parse(storedSession) : { token: "", student: null }
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [authLoading, setAuthLoading] = useState(false)
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)
    return storedCart ? JSON.parse(storedCart) : []
  })

  useEffect(() => {
    if (authState.token) {
      axios.defaults.headers.common.Authorization = `Bearer ${authState.token}`
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState))
      return
    }

    delete axios.defaults.headers.common.Authorization
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [authState])

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    const restoreSession = async () => {
      if (!authState.token) {
        return
      }

      setAuthLoading(true)

      try {
        const response = await axios.get("/api/students/me")
        setAuthState((current) => ({
          ...current,
          student: response.data.student
        }))
      } catch (restoreError) {
        setAuthState({ token: "", student: null })
      } finally {
        setAuthLoading(false)
      }
    }

    restoreSession()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products")
        setProducts(response.data.map((product) => ({ ...product, image: resolveProductImage(product) })))
        setError("")
      } catch (fetchError) {
        setProducts(FALLBACK_PRODUCTS)
        setError("")
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

  const getCartItem = (productId) => {
    return cartItems.find((item) => item._id === productId) || null
  }

  const registerStudent = async (payload) => {
    const response = await axios.post("/api/students/register", payload)
    setAuthState({
      token: response.data.token,
      student: response.data.student
    })
    return response.data
  }

  const loginStudent = async (payload) => {
    const response = await axios.post("/api/students/login", payload)
    setAuthState({
      token: response.data.token,
      student: response.data.student
    })
    return response.data
  }

  const logoutStudent = () => {
    setAuthState({ token: "", student: null })
  }

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <ShopContext.Provider
      value={{
        products,
        loading,
        error,
        currentStudent: authState.student,
        authToken: authState.token,
        authLoading,
        cartItems,
        subtotal,
        totalItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartItem,
        registerStudent,
        loginStudent,
        logoutStudent
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
