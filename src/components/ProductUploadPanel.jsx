import { useState } from "react"
import axios from "axios"
import { useShop } from "../context/ShopContext"

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "General"
}

function ProductUploadPanel() {
  const { currentStudent } = useShop()
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [status, setStatus] = useState({ busy: false, message: "", type: "" })

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!currentStudent) {
      setStatus({
        busy: false,
        type: "error",
        message: "Login first to access the protected image upload API."
      })
      return
    }

    if (!imageFile) {
      setStatus({
        busy: false,
        type: "error",
        message: "Choose an image before creating a product."
      })
      return
    }

    setStatus({ busy: true, message: "", type: "" })

    try {
      const uploadPayload = new FormData()
      uploadPayload.append("image", imageFile)

      const uploadResponse = await axios.post("/api/uploads", uploadPayload, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      await axios.post("/api/products", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        image: uploadResponse.data.imageUrl
      })

      setForm(emptyForm)
      setImageFile(null)
      setStatus({
        busy: false,
        type: "success",
        message: "Product created with uploaded image successfully."
      })
    } catch (error) {
      setStatus({
        busy: false,
        type: "error",
        message: error.response?.data?.message || "Unable to upload and create product right now."
      })
    }
  }

  return (
    <section className="panel upload-panel">
      <p className="eyebrow">Multer Upload</p>
      <h2>Create a product with image upload</h2>
      <p className="section-copy">
        This panel uses the protected `/api/uploads` route first, then saves the uploaded image URL
        through the protected `/api/products` API.
      </p>

      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="upload-grid">
          <input
            placeholder="Product name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Price"
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Stock"
            value={form.stock}
            onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
            required
          />
        </div>

        <textarea
          rows="4"
          placeholder="Product description"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          required
        />

        <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} required />

        {status.message ? (
          <p className={`checkout-message ${status.type === "error" ? "checkout-message-error" : "checkout-message-success"}`}>
            {status.message}
          </p>
        ) : null}

        <button className="primary-button" disabled={status.busy}>
          {status.busy ? "Uploading..." : "Upload product"}
        </button>
      </form>
    </section>
  )
}

export default ProductUploadPanel
