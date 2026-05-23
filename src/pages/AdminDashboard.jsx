import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { uploadImageToCloudinary } from "../utils/cloudinary";

const subCategories = {
  sale: [
    { id: "salades_grillades", label: "Salades & Grillades" },
    { id: "pizza", label: "Pizza" },
    { id: "sandwich", label: "Sandwich" },
    { id: "burger_panuzzo", label: "Burger & Panuzzo" },
    { id: "plats_poutine", label: "Plats & Poutine" },
  ],
  sucre: [
    { id: "crepes_gaufres", label: "Crêpes & Gaufres" },
    { id: "donuts_pancakes_churros", label: "Donuts, Pancakes & Churros" },
    { id: "kunafa_noix", label: "Kunafa & Noix" },
  ],
  glaces_jus: [
  { id: "glaces", label: "Glaces" },
  { id: "jus", label: "Jus" },
  { id: "boissons", label: "Boissons" },
],
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "sale",
    subCategory: "salades_grillades",
    image: null,
  });

  useEffect(() => {
    const checkAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/admin");
      }
    });

    return () => checkAuth();
  }, [navigate]);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("order", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(list);
    });

    return () => unsubscribe();
  }, []);

  function handleChange(e) {
    const { name, value, files } = e.target;

    if (name === "image") {
      setForm({ ...form, image: files[0] });
      return;
    }

    if (name === "category") {
      setForm({
        ...form,
        category: value,
        subCategory: subCategories[value][0].id,
      });
      return;
    }

    setForm({ ...form, [name]: value });
  }

  async function handleAddProduct(e) {
    e.preventDefault();

    if (!form.name || !form.price || !form.image || !form.subCategory) {
      alert("كملي اسم المنتج والسعر والصورة و sous-catégorie");
      return;
    }

    try {
      setLoading(true);

      const imageUrl = await uploadImageToCloudinary(form.image);

      await addDoc(collection(db, "products"), {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        subCategory: form.subCategory,
        imageUrl,
        available: true,
        order: Date.now(),
        createdAt: new Date(),
      });

      setForm({
        name: "",
        price: "",
        category: "sale",
        subCategory: "salades_grillades",
        image: null,
      });

      const input = document.getElementById("imageInput");
      if (input) input.value = "";
    } catch (error) {
      console.error(error);
      alert(error.message || "صار خطأ أثناء إضافة المنتج");
    } finally {
      setLoading(false);
    }
  }

  async function toggleAvailable(product) {
    await updateDoc(doc(db, "products", product.id), {
      available: !product.available,
    });
  }

  async function updateName(productId, newName) {
    await updateDoc(doc(db, "products", productId), {
      name: newName,
    });
  }

  async function updatePrice(productId, newPrice) {
    await updateDoc(doc(db, "products", productId), {
      price: Number(newPrice),
    });
  }

  async function updateCategory(productId, newCategory) {
    await updateDoc(doc(db, "products", productId), {
      category: newCategory,
      subCategory: subCategories[newCategory][0].id,
    });
  }

  async function updateSubCategory(productId, newSubCategory) {
    await updateDoc(doc(db, "products", productId), {
      subCategory: newSubCategory,
    });
  }

  async function deleteProduct(productId) {
    const confirmDelete = confirm("هل تريد حذف هذا المنتج؟");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "products", productId));
  }

  async function logout() {
    await signOut(auth);
    navigate("/admin");
  }

  function getSubCategoryLabel(product) {
    const list = subCategories[product.category] || [];
    return list.find((sub) => sub.id === product.subCategory)?.label || "";
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="small-label">Crispy Family</p>
          <h1>Admin Dashboard</h1>
          <p>Gérer les produits du menu.</p>
        </div>

        <div className="dashboard-actions">
          <Link className="preview-btn" to="/">
            Voir le menu
          </Link>

          <button onClick={logout} className="logout-btn">
            Déconnexion
          </button>
        </div>
      </header>

      <section className="admin-panel">
        <form className="product-form" onSubmit={handleAddProduct}>
          <h2>Ajouter un produit</h2>

          <label>Nom du produit</label>
          <input
            name="name"
            type="text"
            placeholder="Ex: Pizza thon"
            value={form.name}
            onChange={handleChange}
          />

          <label>Prix</label>
          <input
            name="price"
            type="number"
            placeholder="Ex: 450"
            value={form.price}
            onChange={handleChange}
          />

          <label>Catégorie principale</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="sale">Salé</option>
            <option value="sucre">Sucré</option>
            <option value="glaces_jus">Glaces & Jus</option>
          </select>

          <label>Sous-catégorie</label>
          <select
            name="subCategory"
            value={form.subCategory}
            onChange={handleChange}
          >
            {subCategories[form.category].map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.label}
              </option>
            ))}
          </select>

          <label>Image</label>
          <input
            id="imageInput"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Ajout en cours..." : "Ajouter le produit"}
          </button>
        </form>

        <div className="admin-products">
          <h2>Liste des produits</h2>

          {products.length === 0 ? (
            <p className="empty-admin">Aucun produit pour le moment.</p>
          ) : (
            products.map((product) => (
              <div className="admin-product-card" key={product.id}>
                <img src={product.imageUrl} alt={product.name} />

                <div className="admin-product-fields">
                  <input
                    value={product.name}
                    onChange={(e) => updateName(product.id, e.target.value)}
                  />

                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => updatePrice(product.id, e.target.value)}
                  />

                  <select
                    value={product.category}
                    onChange={(e) =>
                      updateCategory(product.id, e.target.value)
                    }
                  >
                    <option value="sale">Salé</option>
                    <option value="sucre">Sucré</option>
                    <option value="glaces_jus">Glaces & Jus</option>
                  </select>

                  <select
                    value={
                      product.subCategory ||
                      subCategories[product.category]?.[0]?.id ||
                      ""
                    }
                    onChange={(e) =>
                      updateSubCategory(product.id, e.target.value)
                    }
                  >
                    {(subCategories[product.category] || []).map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.label}
                      </option>
                    ))}
                  </select>

                  <p className="product-sub-label">
                    Sous-catégorie: {getSubCategoryLabel(product)}
                  </p>
                </div>

                <div className="admin-actions">
                  <button onClick={() => toggleAvailable(product)}>
                    {product.available ? "Disponible" : "Indisponible"}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}