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
        <header className="top-nav">
          <div className="logo-placeholder">
            <span>Logo</span>
          </div>

          <Link className="admin-link" to="/admin">
            Espace admin
          </Link>
        </header>

        <div className="hero-content">
          <p className="small-label">Crispy Family</p>
          <h1>Un menu simple, moderne et gourmand</h1>
          <p className="subtitle">
            Découvrez nos salés, nos sucrés, nos glaces et nos jus. Choisissez
            votre envie puis appelez directement pour commander.
          </p>
        </div>

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

      <section className="products-section">
        <div className="section-title">
          <div>
            <p className="section-label">{activeCategoryLabel}</p>
            <h2>
              {activeSubCategory === "all"
                ? `Tous les produits ${activeCategoryLabel}`
                : activeSubCategoryLabel}
            </h2>
          </div>

          <p>Des produits bien présentés, des prix clairs, un appel direct.</p>
        </div>

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

                  <a className="call-btn" href={`tel:${phone}`}>
                    Appeler
                  </a>
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