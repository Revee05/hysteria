"use client";

import { useEffect, useState } from "react";
import ArticleForm from "../../_partial/_components/Article/ArticleForm";

export default function CreateArticlePage({ onNavigate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/categories/artikel");
      const json = await res.json();
      if (json.success) setCategories(json.data.items);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/articles", {
        method: "POST",
        body: formData, 
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.error || "Gagal menyimpan");
        return;
      }

      onNavigate("article");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <ArticleForm
        categories={categories}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
