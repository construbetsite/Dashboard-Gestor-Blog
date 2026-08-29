
// ============================================================
// LeadDetailModal
// ============================================================
//
// Modal de detalhes de um lead. Aberto ao clicar em uma linha
// da tabela. Mostra todas as informações do lead, incluindo
// IP e User-Agent (capturados pelo backend no cadastro).
//
// - Busca os dados via GET /api/leads/:id
// - Estados de loading / erro (com retry) / sucesso
// - Fecha com Esc, clique no overlay ou botão X

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, X } from "lucide-react";

import { leadService } from "../services/leadService";
import { errorMessage } from "../utils/errors";
import { formatDateTime } from "../../../utils/formatDate";
import type { Lead } from "../types/lead.types";

interface LeadDetailModalProps {
  /** ID do lead a exibir. null = modal fechado. */
  leadId: string | null;
  onClose: () => void;
}

// ============================================================
// LINHA DE INFORMAÇÃO (label + valor)
// ============================================================

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}

function InfoRow({ label, children, mono = false }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd
        className={`min-w-0 text-sm text-slate-800 ${
          mono ? "font-mono text-xs" : "break-words"
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: boolean }) {
  return status ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Ativo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      <span className="h-2 w-2 rounded-full bg-slate-400" />
      Inativo
    </span>
  );
}

function DisplayValue({ value }: { value: string | null }) {
  return value ? value : <span className="text-slate-400">—</span>;
}
export default function LeadDetailModal({
  leadId,
  onClose,
}: LeadDetailModalProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // ------------------------------------------------------------
  // BUSCA DO DETALHE
  // ------------------------------------------------------------

  useEffect(() => {
    if (!leadId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setLead(null);

    leadService
      .buscarPorId(leadId)
      .then((data) => {
        if (!cancelled) setLead(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(errorMessage(e, "Erro ao carregar detalhes do lead."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [leadId, reloadKey]);

  // ------------------------------------------------------------
  // FECHAR COM ESC
  // ------------------------------------------------------------

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!leadId) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [leadId, handleKeyDown]);

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  if (!leadId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-detail-title"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2
              id="lead-detail-title"
              className="text-lg font-semibold text-slate-900"
            >
              Detalhes do Lead
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Informações completas capturadas no cadastro
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 size={26} className="animate-spin text-[#004AAD]" />
              <span className="mt-3 text-sm">Carregando lead...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <p className="rounded-lg border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="inline-flex items-center gap-2 rounded-lg border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Tentar novamente
              </button>
            </div>
          ) : lead ? (
            <dl>
              <InfoRow label="Nome">{lead.nome || "—"}</InfoRow>

              <InfoRow label="E-mail">
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-[#004AAD] underline-offset-2 hover:underline"
                  >
                    {lead.email}
                  </a>
                ) : (
                  "—"
                )}
              </InfoRow>

              <InfoRow label="WhatsApp">
                {lead.whatsapp ? (
                  <a
                    href={`https://wa.me/${lead.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-[#004AAD] underline-offset-2 hover:underline"
                  >
                    {lead.whatsapp}
                  </a>
                ) : (
                  "—"
                )}
              </InfoRow>

              <InfoRow label="Status">
                <StatusBadge status={lead.status} />
              </InfoRow>

              <InfoRow label="IP">
                <DisplayValue value={lead.ip} />
              </InfoRow>

              <InfoRow label="User-Agent" mono>
                <DisplayValue value={lead.user_agent} />
              </InfoRow>

              <InfoRow label="Criado em">
                {formatDateTime(lead.created_at) || "—"}
              </InfoRow>

              <InfoRow label="Atualizado em">
                {formatDateTime(lead.updated_at) || "—"}
              </InfoRow>

              <InfoRow label="ID" mono>
                <DisplayValue value={lead.id} />
              </InfoRow>
            </dl>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">
              Nenhum dado disponível.
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#004AAD] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#003B8F]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
