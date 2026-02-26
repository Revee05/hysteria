"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Tune } from "@mui/icons-material";
import ArticleCard from "@/components/ui/ArticleCard";

export default function ArtikelPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isAnimating, setIsAnimating] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [showSort, setShowSort] = useState(false);
  const dropdownRef = useRef(null);

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(articles.length / itemsPerPage);

  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // ================= FETCH ARTICLES =================
  const fetchArticles = async (
    categoryValue = activeCategory,
    keyword = search,
    sortValue = sortBy,
  ) => {
    try {
      const res = await fetch(
        `/api/articles?search=${keyword}&category=${categoryValue}&sort=${sortValue}`,
      );

      if (!res.ok) return [];

      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error("Fetch error:", err);
      return [];
    }
  };

  // ================= CATEGORY CHANGE HANDLER =================
  const handleCategoryClick = async (categoryValue) => {
    if (categoryValue === activeCategory) return;

    setIsAnimating(true);

    setTimeout(async () => {
      const newData = await fetchArticles(categoryValue);
      setArticles(newData);
      setActiveCategory(categoryValue);
      setIsAnimating(false);
    }, 250); // fade out duration
  };

  // ================= SEARCH EFFECT =================
  useEffect(() => {
    const delay = setTimeout(async () => {
      const newData = await fetchArticles();
      setArticles(newData);
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  // ================= INITIAL LOAD =================
  useEffect(() => {
    const loadInitial = async () => {
      const newData = await fetchArticles();
      setArticles(newData);
    };
    loadInitial();
  }, []);

  // ================= FETCH CATEGORIES =================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories/artikel");
        const json = await res.json();

        if (json.success) {
          setCategories(json.data.items || []);
        }
      } catch (err) {
        console.error("Category fetch error:", err);
      }
    };

    fetchCategories();
  }, []);

  // ================= UPDATE INDICATOR =================
  useEffect(() => {
    const activeTab = tabRefs.current[activeCategory];
    if (activeTab) {
      setIndicatorStyle({
        width: activeTab.offsetWidth,
        left: activeTab.offsetLeft,
      });
    }
  }, [activeCategory, categories]);

  const handleSort = async (value) => {
    setShowSort(false);
    setIsAnimating(true);

    setTimeout(async () => {
      setSortBy(value);
      const newData = await fetchArticles(activeCategory, search, value);
      setArticles(newData);
      setIsAnimating(false);
    }, 250);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSort(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Pagination
  const paginatedArticles = articles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="py-7 w-4xl">
        <h1 className="text-5xl font-bold mb-7">Artikel</h1>
        <p className="text-base">
          Kumpulan tulisan untuk memperkaya wawasan tentang seni, budaya, dan
          kreativitas. Bacaan yang menginspirasi dan mendidik untuk semua
          kalangan.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-3xl mx-auto w-full mb-10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Judul Artikel/Penulis Artikel"
              className="w-full border border-pink-400 rounded-full px-6 py-4 pr-14 
              focus:outline-none focus:ring-2 focus:ring-pink-400 
              transition-all duration-300 placeholder:text-pink-400 text-base text-pink-400"
            />

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 
              text-pink-500 hover:scale-110 transition-transform duration-200"
            >
              <Search />
            </button>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSort(!showSort)}
              className="w-14 h-14 flex items-center justify-center 
    border border-pink-400 rounded-full 
    text-pink-500 hover:bg-pink-500 hover:text-white 
    transition-all duration-300"
            >
              <Tune />
            </button>

            {showSort && (
              <div className="absolute right-0 mt-3 w-56 bg-white shadow-xl rounded-xl p-4 z-50 animate-fade-in">
                <p className="text-sm font-semibold mb-3">Sort by</p>

                <div className="flex flex-col gap-3 text-sm">
                  <button
                    onClick={() => handleSort("newest")}
                    className="text-left hover:text-pink-500"
                  >
                    Terbaru
                  </button>

                  <button
                    onClick={() => handleSort("oldest")}
                    className="text-left hover:text-pink-500"
                  >
                    Terlama
                  </button>

                  <button
                    onClick={() => handleSort("az")}
                    className="text-left hover:text-pink-500"
                  >
                    Judul, A – Z
                  </button>

                  <button
                    onClick={() => handleSort("za")}
                    className="text-left hover:text-pink-500"
                  >
                    Judul, Z – A
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="relative mb-10">
        {/* MOBILE: Horizontal Scroll */}
        <div className="flex lg:hidden overflow-x-auto gap-6 px-2 pb-2 no-scrollbar text-sm">
          <button
            ref={(el) => (tabRefs.current["all"] = el)}
            onClick={() => handleCategoryClick("all")}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-all duration-300
        ${
          activeCategory === "all"
            ? "bg-pink-500 text-white shadow-md"
            : "bg-pink-50 text-pink-500 hover:bg-pink-100"
        }`}
          >
            Semua Artikel
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              ref={(el) => (tabRefs.current[cat.title] = el)}
              onClick={() => handleCategoryClick(cat.title)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-all duration-300
          ${
            activeCategory === cat.title
              ? "bg-pink-500 text-white shadow-md"
              : "bg-pink-50 text-pink-500 hover:bg-pink-100"
          }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* DESKTOP: Grid */}
        <div
          className="hidden lg:grid gap-4 px-5"
          style={{
            gridTemplateColumns: `repeat(${categories.length + 1}, minmax(0, 1fr))`,
          }}
        >
          <button
            ref={(el) => (tabRefs.current["all"] = el)}
            onClick={() => handleCategoryClick("all")}
            className={`pb-3 text-center font-medium transition-colors duration-300
      ${
        activeCategory === "all"
          ? "text-black"
          : "text-gray-500 hover:text-black"
      }`}
          >
            Semua Artikel
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              ref={(el) => (tabRefs.current[cat.title] = el)}
              onClick={() => handleCategoryClick(cat.title)}
              className={`pb-3 text-center font-medium transition-colors duration-300
        ${
          activeCategory === cat.title
            ? "text-black"
            : "text-gray-500 hover:text-black"
        }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Sliding Indicator */}
        <span
          className="absolute bottom-0 h-1 bg-pink-500 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={indicatorStyle}
        />
      </div>

      {/* ARTICLES GRID */}
      <div
        className={`grid grid-cols-2 lg:grid-cols-4 gap-8
  ${isAnimating ? "animate-fade-out" : "animate-fade-in"}
`}
      >
        {paginatedArticles.map((article, index) => {
          const position = index % 5;

          let variant = "small";
          let spanClass = "";

          // Row 1 → small small large large
          if (position === 2) {
            variant = "large";
            spanClass = "lg:col-span-2";
          }

          // Row 3 → large large small small
          if (position === 8) {
            variant = "large";
            spanClass = "lg:col-span-2";
          }

          return (
            <div key={article.id} className={spanClass}>
              <ArticleCard article={article} variant={variant} />
            </div>
          );
        })}
      </div>
      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-16">
          <div className="flex items-center gap-3 bg-pink-500 px-2 py-2 rounded-full shadow-lg">
            {/* PREV BUTTON */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-pink-500 
              disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform text-xl"
            >
              ‹
            </button>

            {/* PAGE NUMBERS */}
            <div className="flex gap-6 text-white font-medium">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`transition-all duration-300
              ${
                currentPage === page
                  ? "scale-125 font-bold"
                  : "opacity-80 hover:opacity-100"
              }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            {/* NEXT BUTTON */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-pink-500 
              disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform text-xl"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
