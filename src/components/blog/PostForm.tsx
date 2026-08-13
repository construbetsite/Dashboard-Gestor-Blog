import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { blogService } from "../../services/blog.service";
import type { BlogPost } from "../../types/blog";
import { Loader2 } from "lucide-react";

interface PostFormProps {
  mode: "create" | "edit";
  post?: BlogPost | null;
}

interface Categoria {
  id: string;
  nome: string;
}

export default function PostForm({ mode, post }: PostFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasLoading, setCategoriasLoading] = useState(true);

  // ✅ Estado do formulário
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    image: "",
    category: "",
    reading_time: "5 min",
    type: "article",
    featured: false,
    video1: "",
    video2: "",
    author: "",
    author_image: "",
    tags: "",
    published_at: "",
  });

  // ✅ Atualizar formData quando post mudar
  useEffect(() => {
    if (post) {
      console.log("📝 [PostForm] Carregando post para edição:", post);
      
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        description: post.description || "",
        content: post.content || "",
        image: post.image || "",
        category: post.category || "",
        reading_time: post.reading_time || "5 min",
        type: post.type || "article",
        featured: post.featured || false,
        video1: post.video1 || "",
        video2: post.video2 || "",
        author: post.author || "",
        author_image: post.author_image || "",
        tags: post.tags?.join(", ") || "",
        published_at: post.published_at
          ? new Date(post.published_at).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [post]);

  // ✅ Carregar categorias
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setCategoriasLoading(true);
        console.log("📚 [PostForm] Buscando categorias...");
        const response = await blogService.listarCategorias();
        const data = Array.isArray(response) ? response : response?.data || [];
        setCategorias(data);
        console.log("📚 [PostForm] Categorias carregadas:", data);
      } catch (err) {
        console.error("❌ [PostForm] Erro ao carregar categorias:", err);
      } finally {
        setCategoriasLoading(false);
      }
    };
    fetchCategorias();
  }, []);

  // ✅ Handler para mudanças nos campos
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Handler para mudança de categoria
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNome = e.target.value;
    
    console.log(`🔄 [PostForm] Categoria selecionada: "${selectedNome}"`);

    setFormData((prev) => ({
      ...prev,
      category: selectedNome,
    }));
  };

  // ✅ Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // ✅ Encontrar a categoria selecionada pelo nome
      const selectedCategoria = categorias.find(
        (c) => c.nome === formData.category
      );

      // ✅ Preparar dados para enviar - DEFINIR TODAS AS PROPRIEDADES DE UMA VEZ
      const dataToSend: any = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        image: formData.image || undefined,
        category: formData.category || undefined,
        categoria_id: selectedCategoria?.id || null,
        reading_time: formData.reading_time || "5 min",
        type: formData.type || "article",
        featured: formData.featured || false,
        video1: formData.video1 || undefined,
        video2: formData.video2 || undefined,
        author: formData.author || undefined,
        author_image: formData.author_image || undefined,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : [],
        published_at: formData.published_at || null,
      };

      // ✅ Adicionar slug se existir (criação ou edição)
      if (formData.slug) {
        dataToSend.slug = formData.slug;
      }

      console.log("📤 [PostForm] Enviando dados:", JSON.stringify(dataToSend, null, 2));

      if (mode === "edit" && post?.id) {
        await blogService.editar(post.id, dataToSend);
      } else {
        await blogService.criar(dataToSend);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/posts");
      }, 1500);
    } catch (err) {
      console.error("❌ [PostForm] Erro ao salvar post:", err);
      setError(err instanceof Error ? err.message : "Erro ao salvar post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
          Post salvo com sucesso!
        </div>
      )}

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Título *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Slug
        </label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="exemplo-de-slug"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-slate-500 mt-1">
          Deixe em branco para gerar automaticamente
        </p>
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Descrição
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Conteúdo */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Conteúdo *
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={10}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
        />
      </div>

      {/* ✅ SELEÇÃO DE CATEGORIA */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Categoria
        </label>
        <select
          name="category"
          value={formData.category || ""}
          onChange={handleCategoriaChange}
          disabled={categoriasLoading}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.nome}>
              {cat.nome}
            </option>
          ))}
        </select>
        {categoriasLoading && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Loader2 size={14} className="animate-spin" />
            Carregando categorias...
          </p>
        )}
        {formData.category && (
          <p className="text-xs text-emerald-600 mt-1">
            ✅ Categoria selecionada: <strong>{formData.category}</strong>
          </p>
        )}
      </div>

      {/* Imagem */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          URL da Imagem
        </label>
        <input
          type="text"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://exemplo.com/imagem.jpg"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Autor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Autor
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Imagem do Autor
          </label>
          <input
            type="text"
            name="author_image"
            value={formData.author_image}
            onChange={handleChange}
            placeholder="https://exemplo.com/avatar.jpg"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tags (separadas por vírgula)
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="react, javascript, typescript"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Configurações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tempo de Leitura
          </label>
          <input
            type="text"
            name="reading_time"
            value={formData.reading_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tipo
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="article">Artigo</option>
            <option value="video">Vídeo</option>
            <option value="news">Notícia</option>
          </select>
        </div>
      </div>

      {/* Vídeos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Vídeo 1 (URL)
          </label>
          <input
            type="text"
            name="video1"
            value={formData.video1}
            onChange={handleChange}
            placeholder="https://youtube.com/..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Vídeo 2 (URL)
          </label>
          <input
            type="text"
            name="video2"
            value={formData.video2}
            onChange={handleChange}
            placeholder="https://youtube.com/..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Opções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <label className="text-sm font-medium text-slate-700">
            Destacar post
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Data de Publicação
          </label>
          <input
            type="datetime-local"
            name="published_at"
            value={formData.published_at}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          {isSubmitting
            ? "Salvando..."
            : mode === "edit"
            ? "Atualizar"
            : "Publicar"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/posts")}
          className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}