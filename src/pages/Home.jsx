import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

const categories = [
  { id: "sale", label: "Salé" },
  { id: "sucre", label: "Sucré" },
  { id: "glaces_jus", label: "Glaces & Jus" },
];

const subCategories = {
  sale: [
    { id: "all", label: "Tous" },
    { id: "salades_grillades", label: "Salades & Grillades" },
    { id: "pizza", label: "Pizza" },
    { id: "sandwich", label: "Sandwich" },
    { id: "burger_panuzzo", label: "Burger & Panuzzo" },
    { id: "plats_poutine", label: "Plats & Poutine" },
  ],
  sucre: [
    { id: "all", label: "Tous" },
    { id: "crepes_gaufres", label: "Crêpes & Gaufres" },
    { id: "donuts_pancakes_churros", label: "Donuts, Pancakes & Churros" },
    { id: "kunafa_noix", label: "Kunafa & Noix" },
  ],
 glaces_jus: [
  { id: "all", label: "Tous" },
  { id: "glaces", label: "Glaces" },
  { id: "jus", label: "Jus" },
  { id: "boissons", label: "Boissons" },
],
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("sale");
  const [activeSubCategory, setActiveSubCategory] = useState("all");
  const [products, setProducts] = useState([]);

  const phone = import.meta.env.VITE_SERVICE_PHONE;
const mapsUrl = import.meta.env.VITE_MAPS_URL;
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

  function handleCategoryChange(categoryId) {
    setActiveCategory(categoryId);
    setActiveSubCategory("all");
  }

  const filteredProducts = products.filter((product) => {
    const sameCategory = product.category === activeCategory;
    const isAvailable = product.available !== false;
    const sameSubCategory =
      activeSubCategory === "all" || product.subCategory === activeSubCategory;

    return sameCategory && isAvailable && sameSubCategory;
  });

  const activeCategoryLabel =
    categories.find((cat) => cat.id === activeCategory)?.label || "";

  const activeSubCategoryLabel =
    subCategories[activeCategory].find((sub) => sub.id === activeSubCategory)
      ?.label || "";

  return (
    <main className="site">
      <section className="hero">
       <header className="top-nav minimal-nav">
  <div></div>

  <h1 className="brand-title">Crispy Family</h1>

  <Link className="admin-icon-link" to="/admin" aria-label="Espace admin">
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.04.04a2 2 0 1 1-2.83 2.83l-.04-.04A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6l-.06.08a2 2 0 0 1-3.88 0L10 20a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.04.04a2 2 0 1 1-2.83-2.83l.04-.04A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1l-.08-.06a2 2 0 0 1 0-3.88L4 10a1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.04-.04a2 2 0 1 1 2.83-2.83l.04.04A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6l.06-.08a2 2 0 0 1 3.88 0L14 4a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.04-.04a2 2 0 1 1 2.83 2.83l-.04.04A1.7 1.7 0 0 0 19.4 9c.2.36.4.66.6 1l.08.06a2 2 0 0 1 0 3.88L20 14a1.7 1.7 0 0 0-.6 1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </Link>
</header>
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={activeCategory === cat.id ? "tab active" : "tab"}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="sub-category-tabs">
          {subCategories[activeCategory].map((sub) => (
            <button
              key={sub.id}
              className={
                activeSubCategory === sub.id
                  ? "sub-tab active-sub"
                  : "sub-tab"
              }
              onClick={() => setActiveSubCategory(sub.id)}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </section>

      <section className="products-section clean-products-section">
  <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <p className="empty">Aucun produit disponible pour le moment.</p>
          ) : (
            filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="image-wrapper">
                  <img src={product.imageUrl} alt={product.name} />
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">{product.price} DA</p>

                 <div className="mobile-quick-actions">
  <a
    className="quick-action-btn map-action"
    href={mapsUrl}
    target="_blank"
    rel="noreferrer"
    aria-label="Voir le restaurant sur Google Maps"
  >
    📍 <span>Localiser</span>
  </a>

  <a
    className="quick-action-btn call-action"
    href={`tel:${phone}`}
    aria-label="Appeler le restaurant"
  >
    📞 <span>Appeler</span>
  </a>
</div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <a className="floating-call" href={`tel:${phone}`}>
        📞 Commander par appel
      </a>
    </main>
  );
}