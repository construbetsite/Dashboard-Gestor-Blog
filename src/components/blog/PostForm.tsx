import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { blogService, isValidUUID } from "../../services/blog.service";
import type { BlogPost } from "../../types/blog";
import { Loader2, ImageIcon, Trash2, UploadCloud } from "lucide-react";
import ProductMultiSelect from "./ProductMultiSelect";
import { getImageUrl } from "../../utils/imageUrl";
import { validateImageFile, formatUploadError } from "../../utils/imageValidation";

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasLoading, setCategoriasLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  // âœ… Produtos vinculados (array de UUIDs; campo OPCIONAL)
  const [productIds, setProductIds] = useState<string[]>([]);
  // Produtos jÃ¡ vinculados ao post (vindos do ?include=products), para resolver nomes
  const preloadedProducts = post?.products?.map((p) => ({ id: p.id, name: p.name })) ?? null;

  const resolvePreviewUrl = (value?: string) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("data:image/") || trimmed.startsWith("blob:")) {
      return trimmed;
    }
    return getImageUrl(trimmed);
  };

  // âœ… Estado do formulÃ¡rio (camelCase conforme contrato de API)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    imageUrl: "",
    categoriaId: "",      // UUID (obrigatÃ³rio)
    category: "",         // Nome legÃ­vel (obrigatÃ³rio) â† NOVO
    readingTime: "5 min",
    type: "article",
    featured: false,
    status: true,
    video1: "",
    video2: "",
    author: "",
    authorImage: "",
    tags: "",
    publishedAt: "",
  });

  // âœ… Atualizar formData quando post mudar
  useEffect(() => {
    if (post) {
      console.log("ðŸ“ [PostForm] Carregando post para ediÃ§Ã£o:", post);
      const postImage = post.image_url || "";

      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        description: post.description || "",
        content: post.content || "",
        imageUrl: postImage,
        categoriaId: post.categoria_id || "",
        category: post.category || "",        // â† Nome da categoria
        readingTime: post.reading_time || "5 min",
        type: post.type || "article",
        featured: post.featured || false,
        status: post.status ?? true,
        video1: post.video1 || "",
        video2: post.video2 || "",
        author: post.author || "",
        authorImage: post.author_image || "",
        tags: post.tags?.join(", ") || "",
        publishedAt: post.published_at
          ? new Date(post.published_at).toISOString().slice(0, 16)
          : "",
      });
      setImagePreview(resolvePreviewUrl(postImage));
      setSelectedImageFile(null);
      // âœ… PrÃ©-selecionar produtos vinculados (ediÃ§Ã£o)
      setProductIds(Array.isArray(post.product_ids) ? post.product_ids : []);
    } else {
      setFormData((prev) => ({ ...prev, imageUrl: "" }));
      setImagePreview("");
      setSelectedImageFile(null);
      setProductIds([]);
    }
  }, [post]);

  // âœ… Carregar categorias
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setCategoriasLoading(true);
        console.log("ðŸ“š [PostForm] Buscando categorias...");
        const response = await blogService.listarCategorias();
        const data = Array.isArray(response) ? response : response?.data || [];
        setCategorias(data);
        console.log("ðŸ“š [PostForm] Categorias carregadas:", data);
      } catch (err) {
        console.error("âŒ [PostForm] Erro ao carregar categorias:", err);
      } finally {
        setCategoriasLoading(false);
      }
    };
    fetchCategorias();
  }, []);

  // âœ… Handler para mudanÃ§as nos campos
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "imageUrl") {
      const nextValue = value;
      setFormData((prev) => ({
        ...prev,
        imageUrl: nextValue,
      }));
      setSelectedImageFile(null);
      setImagePreview(nextValue.trim() ? resolvePreviewUrl(nextValue) : "");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Erro ao validar imagem");
      console.warn("âš ï¸ [PostForm] ValidaÃ§Ã£o de imagem falhou:", validation.error);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const previewUrl = typeof reader.result === "string" ? reader.result : "";
      setSelectedImageFile(file);
      setImagePreview(previewUrl);
      setFormData((prev) => ({ ...prev, imageUrl: "" }));
      setError(null);
      console.log("âœ… [PostForm] Imagem selecionada:", {
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)}KB`,
        type: file.type,
      });
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearSelectedImage = () => {
    setSelectedImageFile(null);
    setImagePreview(formData.imageUrl ? resolvePreviewUrl(formData.imageUrl) : "");
    setFormData((prev) => ({ ...prev, imageUrl: prev.imageUrl || "" }));
  };

  // âœ… Handler para mudanÃ§a de categoria (armazena AMBOS UUID e nome)
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedCategory = categorias.find((cat) => cat.id === selectedId);

    console.log(`ðŸ”„ [PostForm] Categoria selecionada:`, {
      id: selectedId,
      nome: selectedCategory?.nome,
    });

    setFormData((prev) => ({
      ...prev,
      categoriaId: selectedId,                // UUID
      category: selectedCategory?.nome || "", // Nome legÃ­vel
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadingImage(false);
    setError(null);
    setSuccess(false);

    try {
      let imageUrl = formData.imageUrl || null;
      let imagePath: string | null = null;
      let imageFilename: string | null = null;
      let imageSize: number | null = null;
      let imageMimeType: string | null = null;

      // âœ… ETAPA 1: Upload da imagem (se houver)
      if (selectedImageFile) {
        setUploadingImage(true);
        console.log("ðŸ“¤ [PostForm] Fazendo upload do arquivo...", {
          name: selectedImageFile.name,
          size: selectedImageFile.size,
          type: selectedImageFile.type,
        });

        const uploadFormData = new FormData();
        uploadFormData.append("image", selectedImageFile);

        try {
          const uploadResponse = await blogService.uploadImage(uploadFormData);

          if (uploadResponse.success) {
            imageUrl = uploadResponse.data.url;
            imagePath = uploadResponse.data.path;
            imageFilename = selectedImageFile.name;
            imageSize = selectedImageFile.size;
            imageMimeType = selectedImageFile.type;
            console.log("âœ… [PostForm] Upload concluÃ­do:", { imageUrl, imagePath });
          } else {
            throw new Error(uploadResponse.message || "Falha no upload da imagem");
          }
        } catch (uploadError: any) {
          console.error("âŒ [PostForm] Erro no upload:", uploadError);

          let errorMessage = "Erro ao fazer upload da imagem";
          if (uploadError.response?.status === 413) {
            errorMessage = formatUploadError(413);
          } else if (uploadError.response?.status === 415) {
            errorMessage = formatUploadError(415);
          } else if (uploadError.response?.status === 401) {
            errorMessage = formatUploadError(401);
          } else if (uploadError.response?.status === 403) {
            errorMessage = formatUploadError(403);
          } else if (uploadError.message) {
            errorMessage = uploadError.message;
          }

          setError(errorMessage);
          setIsSubmitting(false);
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      // âœ… ETAPA 2: Validar categoria (obrigatÃ³rio)
      if (!formData.categoriaId || !formData.category) {
        setError("Selecione uma categoria vÃ¡lida (UUID e nome sÃ£o obrigatÃ³rios)");
        setIsSubmitting(false);
        console.error("âŒ [PostForm] Categoria incompleta:", {
          categoriaId: formData.categoriaId,
          category: formData.category,
        });
        return;
      }

      if (!isValidUUID(formData.categoriaId)) {
        setError("Categoria selecionada Ã© invÃ¡lida. Selecione uma categoria vÃ¡lida.");
        setIsSubmitting(false);
        console.error("âŒ [PostForm] UUID de categoria invÃ¡lido:", formData.categoriaId);
        return;
      }

      // âœ… ETAPA 3: Montar o payload em camelCase (conforme contrato de API)
      const dataToSend: any = {
        title: formData.title,
        description: formData.description,
        categoriaId: formData.categoriaId,   // â† UUID (obrigatÃ³rio)
        category: formData.category,         // â† Nome legÃ­vel (obrigatÃ³rio)
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (formData.content) dataToSend.content = formData.content;
      if (formData.slug) dataToSend.slug = formData.slug;
      if (formData.readingTime) dataToSend.readingTime = formData.readingTime;
      if (formData.type) dataToSend.type = formData.type;
      if (formData.featured !== undefined) dataToSend.featured = formData.featured;
      if (formData.status !== undefined) dataToSend.status = formData.status;
      if (formData.video1) dataToSend.video1 = formData.video1;
      if (formData.video2) dataToSend.video2 = formData.video2;
      if (formData.author) dataToSend.author = formData.author;
      if (formData.authorImage) dataToSend.authorImage = formData.authorImage;
      if (formData.publishedAt) dataToSend.publishedAt = formData.publishedAt;

      // Tags
      if (formData.tags) {
        const parsedTags = formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        if (parsedTags.length > 0) dataToSend.tags = parsedTags;
      }

      // âœ… PRODUTOS VINCULADOS: sempre enviar o array completo (estado atual do campo)
      // Backend converte productIds -> product_ids (toSnakeCase). Aceita [] para limpar.
      dataToSend.productIds = Array.isArray(productIds) ? productIds : [];
      // Dados de imagem (vindo do upload)
      if (imageUrl) {
        dataToSend.imageUrl = imageUrl;
        console.log("âœ… [PostForm] imageUrl adicionado ao payload:", imageUrl);
      }
      if (imagePath) dataToSend.imagePath = imagePath;
      if (imageFilename) dataToSend.imageFilename = imageFilename;
      if (imageSize) dataToSend.imageSize = imageSize;
      if (imageMimeType) dataToSend.imageMimeType = imageMimeType;

      // âœ… ETAPA 4: Log de depuraÃ§Ã£o (verificar camelCase)
      console.log("ðŸ“¤ [PostForm] Payload (camelCase):", JSON.stringify(dataToSend, null, 2));
      console.log("ðŸ“¤ [PostForm] VerificaÃ§Ã£o de campos:", {
        temTitle: !!dataToSend.title,
        temDescription: !!dataToSend.description,
        temCategoriaId: !!dataToSend.categoriaId,
        temCategory: !!dataToSend.category,
        temImageUrl: !!dataToSend.imageUrl,
        contemCampoImage: 'image' in dataToSend ? "âŒ ERRO: campo 'image' presente!" : "âœ… OK",
      });

      // âœ… ETAPA 5: Submeter o post
      if (mode === "edit" && post?.id) {
        console.log(`ðŸ“ [PostForm] Editando post: ${post.id}`);
        await blogService.editar(post.id, dataToSend);
      } else {
        console.log("ðŸ“ [PostForm] Criando novo post");
        await blogService.criar(dataToSend);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/posts");
      }, 1500);
    } catch (err: any) {
      console.error("âŒ [PostForm] Erro ao salvar post:", err);

      let errorMessage = "Erro ao salvar post";

      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.status === 400) {
        const errorData = err.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(". ");
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = "Dados invÃ¡lidos. Verifique o formulÃ¡rio.";
        }
      } else if (err.response?.status === 401) {
        errorMessage = "VocÃª nÃ£o estÃ¡ autenticado. FaÃ§a login novamente.";
      } else if (err.response?.status === 403) {
        errorMessage = "VocÃª nÃ£o tem permissÃ£o para realizar esta aÃ§Ã£o.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erro no servidor. Tente novamente mais tarde.";
      }

      setError(errorMessage);
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

      {/* TÃ­tulo */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          TÃ­tulo *
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

      {/* DescriÃ§Ã£o */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          DescriÃ§Ã£o *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* ConteÃºdo */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          ConteÃºdo
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={10}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
        />
      </div>

      {/* âœ… SELEÃ‡ÃƒO DE CATEGORIA (UUID) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Categoria *
        </label>
        <select
          name="categoriaId"
          value={formData.categoriaId || ""}
          onChange={handleCategoriaChange}
          disabled={categoriasLoading}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
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
        {formData.categoriaId && formData.category && (
          <p className="text-xs text-emerald-600 mt-1">
            âœ… Categoria selecionada: <strong>{formData.category}</strong>
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Status
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, status: true }))}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              formData.status
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Ativo
          </button>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, status: false }))}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
              !formData.status
                ? "border-rose-500 bg-rose-50 text-rose-700"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Inativo
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Posts ativos aparecem no blog. Inativos ficam ocultos da publicaÃ§Ã£o.
        </p>
      </div>

      {/* Imagem */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Imagem do Post
        </label>

        <div className="mb-3 overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
          {uploadingImage ? (
            <div className="flex h-56 w-full flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <span className="text-sm font-medium">Enviando imagem...</span>
            </div>
          ) : imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview da imagem"
              className="h-56 w-full object-cover"
            />
          ) : (
            <div className="flex h-56 w-full items-center justify-center text-slate-500">
              <div className="flex flex-col items-center gap-2">
                <ImageIcon size={32} className="text-slate-400" />
                <span className="text-sm">Nenhuma imagem selecionada</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
              URL da imagem
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100">
              <UploadCloud size={16} />
              Upload de imagem
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {(imagePreview || formData.imageUrl) && (
              <button
                type="button"
                onClick={clearSelectedImage}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
              >
                <Trash2 size={14} />
                Limpar
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            {selectedImageFile
              ? `âœ… Arquivo selecionado: ${selectedImageFile.name} (${(selectedImageFile.size / 1024).toFixed(0)}KB) - Pronto para upload`
              : "ðŸ“· Formatos permitidos: JPEG, PNG, WEBP (mÃ¡x. 5MB). Digite uma URL ou faÃ§a upload de uma imagem."}
          </p>
        </div>
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
            name="authorImage"
            value={formData.authorImage}
            onChange={handleChange}
            placeholder="https://exemplo.com/avatar.jpg"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* âœ… PRODUTOS VINCULADOS (opcional, multi-seleÃ§Ã£o com busca) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Produtos Vinculados
        </label>
        <ProductMultiSelect
          value={productIds}
          onChange={setProductIds}
          preloaded={preloadedProducts}
          placeholder="Buscar produtos para vincular..."
          disabled={isSubmitting}
        />
      </div>
      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tags (separadas por vÃ­rgula)
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

      {/* ConfiguraÃ§Ãµes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tempo de Leitura
          </label>
          <input
            type="text"
            name="readingTime"
            value={formData.readingTime}
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
            <option value="video">VÃ­deo</option>
            <option value="news">NotÃ­cia</option>
          </select>
        </div>
      </div>

      {/* VÃ­deos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            VÃ­deo 1 (URL)
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
            VÃ­deo 2 (URL)
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

      {/* OpÃ§Ãµes */}
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
            Data de PublicaÃ§Ã£o
          </label>
          <input
            type="datetime-local"
            name="publishedAt"
            value={formData.publishedAt}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* BotÃµes */}
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


