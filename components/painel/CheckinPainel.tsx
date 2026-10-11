"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import jsQR from "jsqr";
import {
  Camera,
  CameraOff,
  Check,
  CircleAlert,
  CircleCheck,
  Minus,
  Plus,
  Search,
  Undo2,
  UserCheck,
} from "lucide-react";
import {
  ajustarPessoas,
  checkinPorCodigo,
  checkinPorId,
  desfazerCheckin,
  type ConvidadoCheckin,
  type ResultadoCheckin,
} from "@/app/painel/checkin/actions";

export type LinhaCheckin = {
  id: string;
  nome: string;
  lado: string | null;
  confirmado: boolean | null;
  esperadas: number;
  chegou: boolean;
  pessoas: number;
  mesa: string | null;
  chegadaEm: string | null;
};

type Filtro = "todos" | "aguardando" | "chegaram";

const formatoHora = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

function ResultadoCard({
  resultado,
  onFechar,
  onRegistrarMesmoAssim,
  onAjustar,
  onDesfazer,
}: {
  resultado: ResultadoCheckin;
  onFechar: () => void;
  onRegistrarMesmoAssim: (id: string) => void;
  onAjustar: (c: ConvidadoCheckin, pessoas: number) => void;
  onDesfazer: (c: ConvidadoCheckin) => void;
}) {
  if (resultado.status === "nao_encontrado") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-rosa/30 bg-rosa/5 p-4 text-rosa">
        <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="font-medium">QR code não reconhecido</p>
          <p className="text-sm opacity-80">
            Esse código não pertence a nenhum convidado da sua lista.
          </p>
        </div>
        <button type="button" onClick={onFechar} className="text-xs underline">
          Fechar
        </button>
      </div>
    );
  }

  const { convidado } = resultado;
  const info = [
    `${convidado.pessoas} ${convidado.pessoas === 1 ? "pessoa" : "pessoas"}`,
    convidado.mesa ? convidado.mesa : "sem mesa definida",
  ].join(" · ");

  if (resultado.status === "nao_confirmado") {
    return (
      <div className="rounded-2xl border border-rosa/30 bg-rosa/5 p-4">
        <div className="flex items-start gap-3 text-rosa">
          <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">
              {convidado.nome} {convidado.confirmado === false ? "disse que não viria" : "não confirmou presença"}
            </p>
            <p className="text-sm opacity-80">
              Quer registrar a chegada mesmo assim?
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onRegistrarMesmoAssim(convidado.id)}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
          >
            Registrar mesmo assim
          </button>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full border border-border px-4 py-2 text-sm text-foreground/80"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  const repetido = resultado.status === "ja_chegou";

  return (
    <div
      className={`rounded-2xl border p-5 ${
        repetido ? "border-sol/50 bg-sol/10" : "border-verde/40 bg-verde/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
            repetido ? "bg-sol/25 text-[#8a6a1f]" : "bg-verde text-white"
          }`}
        >
          {repetido ? <CircleAlert size={22} aria-hidden /> : <Check size={22} aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {repetido ? "Já fez check-in" : "Check-in feito"}
          </p>
          <p className="truncate font-serif text-2xl text-foreground">
            {convidado.nome}
          </p>
          <p className="text-sm text-foreground/70">{info}</p>
        </div>
        <button
          type="button"
          onClick={onFechar}
          className="text-xs text-muted-foreground underline"
        >
          Fechar
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
          <button
            type="button"
            aria-label="Menos uma pessoa"
            onClick={() => onAjustar(convidado, convidado.pessoas - 1)}
            disabled={convidado.pessoas <= 1}
            className="flex size-8 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
          >
            <Minus size={15} aria-hidden />
          </button>
          <span className="min-w-20 text-center text-sm">
            {convidado.pessoas} {convidado.pessoas === 1 ? "pessoa" : "pessoas"}
          </span>
          <button
            type="button"
            aria-label="Mais uma pessoa"
            onClick={() => onAjustar(convidado, convidado.pessoas + 1)}
            className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <Plus size={15} aria-hidden />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onDesfazer(convidado)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline hover:text-rosa"
        >
          <Undo2 size={14} aria-hidden />
          Desfazer check-in
        </button>
      </div>
    </div>
  );
}

export function CheckinPainel({ linhas }: { linhas: LinhaCheckin[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rodando = useRef(false);
  const pausado = useRef(false);

  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [erroCamera, setErroCamera] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoCheckin | null>(null);
  const [codigoManual, setCodigoManual] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [pendente, iniciar] = useTransition();

  function pararCamera() {
    rodando.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraAtiva(false);
  }

  useEffect(() => pararCamera, []);

  async function tratarCodigo(texto: string) {
    const r = await checkinPorCodigo(texto);
    setResultado(r);
  }

  function loop() {
    if (!rodando.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (
      video &&
      canvas &&
      !pausado.current &&
      video.readyState === video.HAVE_ENOUGH_DATA
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const lido = jsQR(img.data, img.width, img.height, {
          inversionAttempts: "dontInvert",
        });
        if (lido?.data) {
          pausado.current = true;
          tratarCodigo(lido.data).finally(() => {
            setTimeout(() => {
              pausado.current = false;
            }, 2500);
          });
        }
      }
    }
    requestAnimationFrame(loop);
  }

  async function abrirCamera() {
    setErroCamera(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      rodando.current = true;
      pausado.current = false;
      setCameraAtiva(true);
      requestAnimationFrame(loop);
    } catch {
      setErroCamera(
        "Não foi possível acessar a câmera. Permita o acesso no navegador ou use a lista abaixo."
      );
    }
  }

  function aplicarLocal(id: string, mudanca: Partial<ConvidadoCheckin>) {
    setResultado((atual) =>
      atual && "convidado" in atual && atual.convidado.id === id
        ? { ...atual, convidado: { ...atual.convidado, ...mudanca } }
        : atual
    );
  }

  const contagens = useMemo(
    () => ({
      todos: linhas.length,
      aguardando: linhas.filter((l) => !l.chegou).length,
      chegaram: linhas.filter((l) => l.chegou).length,
    }),
    [linhas]
  );

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return linhas.filter(
      (l) =>
        (filtro === "todos" ||
          (filtro === "chegaram" ? l.chegou : !l.chegou)) &&
        (!termo || l.nome.toLowerCase().includes(termo))
    );
  }, [linhas, filtro, busca]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-foreground">
              Ler QR code na entrada
            </h2>
            <p className="text-xs text-muted-foreground">
              Aponte a câmera para o QR do convite do convidado.
            </p>
          </div>
          {cameraAtiva ? (
            <button
              type="button"
              onClick={pararCamera}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 hover:border-rosa/40 hover:text-rosa"
            >
              <CameraOff size={16} aria-hidden />
              Fechar câmera
            </button>
          ) : (
            <button
              type="button"
              onClick={abrirCamera}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              <Camera size={16} aria-hidden />
              Abrir câmera
            </button>
          )}
        </div>

        <div
          className={`mt-4 overflow-hidden rounded-2xl bg-foreground ${
            cameraAtiva ? "" : "hidden"
          }`}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            className="mx-auto max-h-80 w-full object-cover"
          />
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {erroCamera && <p className="mt-3 text-sm text-rosa">{erroCamera}</p>}

        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!codigoManual.trim()) return;
            iniciar(async () => {
              await tratarCodigo(codigoManual);
              setCodigoManual("");
            });
          }}
        >
          <label className="sr-only" htmlFor="codigo-manual">
            Código do convite
          </label>
          <input
            id="codigo-manual"
            value={codigoManual}
            onChange={(e) => setCodigoManual(e.target.value)}
            placeholder="Ou digite o código do convite"
            className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={pendente}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground/80 hover:border-accent/40 hover:text-accent disabled:opacity-50"
          >
            {pendente ? "Buscando..." : "Registrar"}
          </button>
        </form>
      </section>

      {resultado && (
        <ResultadoCard
          resultado={resultado}
          onFechar={() => setResultado(null)}
          onRegistrarMesmoAssim={(id) =>
            iniciar(async () => setResultado(await checkinPorId(id)))
          }
          onAjustar={(c, pessoas) => {
            const total = Math.max(1, pessoas);
            aplicarLocal(c.id, { pessoas: total });
            iniciar(() => ajustarPessoas(c.id, total));
          }}
          onDesfazer={(c) =>
            iniciar(async () => {
              await desfazerCheckin(c.id);
              setResultado(null);
            })
          }
        />
      )}

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div role="tablist" aria-label="Filtrar" className="flex flex-wrap gap-2">
            {(
              [
                ["todos", "Todos"],
                ["aguardando", "Aguardando"],
                ["chegaram", "Chegaram"],
              ] as const
            ).map(([id, rotulo]) => {
              const ativo = filtro === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={ativo}
                  onClick={() => setFiltro(id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    ativo
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {rotulo}{" "}
                  <span className={ativo ? "text-white/70" : "text-muted-foreground"}>
                    {contagens[id]}
                  </span>
                </button>
              );
            })}
          </div>
          <label className="relative block sm:w-60">
            <span className="sr-only">Buscar convidado</span>
            <Search
              size={16}
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome"
              className="w-full rounded-full border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-accent"
            />
          </label>
        </div>

        {visiveis.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            {linhas.length === 0
              ? "Os convidados que confirmarem presença aparecem aqui."
              : "Nenhum convidado encontrado."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visiveis.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 sm:px-5"
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                    l.chegou ? "bg-verde text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {l.chegou ? <CircleCheck size={20} aria-hidden /> : <UserCheck size={18} aria-hidden />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{l.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.chegou
                      ? `Chegou às ${formatoHora.format(new Date(l.chegadaEm!))} · ${l.pessoas} ${l.pessoas === 1 ? "pessoa" : "pessoas"}`
                      : `${l.esperadas} ${l.esperadas === 1 ? "pessoa esperada" : "pessoas esperadas"}`}
                    {l.mesa ? ` · ${l.mesa}` : ""}
                  </p>
                </div>
                {l.chegou ? (
                  <button
                    type="button"
                    disabled={pendente}
                    onClick={() => iniciar(() => desfazerCheckin(l.id))}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 hover:border-rosa/40 hover:text-rosa disabled:opacity-50"
                  >
                    <Undo2 size={14} aria-hidden />
                    Desfazer
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pendente}
                    onClick={() =>
                      iniciar(async () => setResultado(await checkinPorId(l.id)))
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    <Check size={14} aria-hidden />
                    Fazer check-in
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
