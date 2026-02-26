"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ArticleForm from "@/app/admin/_partial/_components/Article/ArticleForm";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id; // pastikan ada

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return; 

    const fetchArticle = async () => {
      const res = await fetch(`/api/admin/articles/${id}`);

      if (!res.ok) {
        console.error("Failed:", await res.text());
        return;
      }

      const json = await res.json();

      console.log("ARTICLE FROM API:", json);

      if (json.success) {
        setInitialData(json.data);
      }

      setLoading(false);
    };

    fetchArticle();
  }, [id]);

  const handleUpdate = async (formData) => {
    await fetch(`/api/admin/articles/${id}`, {
      method: "PUT",
      body: formData,
    });

    alert("Artikel berhasil diperbarui");
    router.push("/admin/articles");
  };

  if (!id) return <div>Loading ID...</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <ArticleForm
      initialData={initialData}
      mode="edit"
      onSubmit={handleUpdate}
    />
  );
}
