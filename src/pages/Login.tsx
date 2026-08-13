
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";


// ============================================================
// CAPTCHA
// ============================================================

const numberWords: Record<number, string> = {
  1: "um",
  2: "dois",
  3: "três",
  4: "quatro",
  5: "cinco",
  6: "seis",
  7: "sete",
  8: "oito",
  9: "nove",
  10: "dez",
};

type Operator = "add" | "sub" | "mul";


// ============================================================
// LOGIN
// ============================================================

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ----------------------------------------------------------
  // FORMULÁRIO
  // ----------------------------------------------------------

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // CAPTCHA
  // ----------------------------------------------------------

  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<Operator>("add");
  const [captchaInput, setCaptchaInput] = useState("");
  const [expectedHash, setExpectedHash] = useState("");

  const startTime = useRef(Date.now());

  const generateCaptcha = () => {
    const operators: Operator[] = ["add", "sub", "mul"];

    const selectedOperator =
      operators[Math.floor(Math.random() * operators.length)];

    let firstNumber = Math.floor(Math.random() * 10) + 1;
    let secondNumber = Math.floor(Math.random() * 10) + 1;

    // Evita resultado negativo
    if (
      selectedOperator === "sub" &&
      firstNumber < secondNumber
    ) {
      [firstNumber, secondNumber] = [
        secondNumber,
        firstNumber,
      ];
    }

    // Mantém multiplicações simples
    if (
      selectedOperator === "mul" &&
      secondNumber > 5
    ) {
      secondNumber = Math.floor(Math.random() * 5) + 1;
    }

    let result = 0;

    switch (selectedOperator) {
      case "add":
        result = firstNumber + secondNumber;
        break;

      case "sub":
        result = firstNumber - secondNumber;
        break;

      case "mul":
        result = firstNumber * secondNumber;
        break;
    }

    setNum1(firstNumber);
    setNum2(secondNumber);
    setOperator(selectedOperator);
    setExpectedHash(btoa(String(result)));
    setCaptchaInput("");

    // Reinicia o tempo do CAPTCHA
    startTime.current = Date.now();
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // ----------------------------------------------------------
  // OPERADORES
  // ----------------------------------------------------------

  const getOperatorSymbol = () => {
    switch (operator) {
      case "add":
        return "+";

      case "sub":
        return "−";

      case "mul":
        return "×";
    }
  };

  const getOperatorWord = () => {
    switch (operator) {
      case "add":
        return "mais";

      case "sub":
        return "menos";

      case "mul":
        return "vezes";
    }
  };

  // ----------------------------------------------------------
  // ENVIO DO FORMULÁRIO
  // ----------------------------------------------------------

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    // Pequena proteção contra envio automatizado
    const elapsed = Date.now() - startTime.current;

    if (elapsed < 2000) {
      setError("Aguarde alguns segundos antes de enviar.");
      generateCaptcha();
      return;
    }

    // Validação dos campos
    if (!email.trim() || !senha) {
      setError("Preencha e-mail e senha.");
      return;
    }

    // Validação CAPTCHA
    const result = parseInt(atob(expectedHash), 10);
    const answer = parseInt(captchaInput, 10);

    if (Number.isNaN(answer) || answer !== result) {
      setError(
        `Resposta incorreta. Quanto é ${numberWords[num1]} ${getOperatorWord()} ${numberWords[num2]}?`
      );

      generateCaptcha();
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), senha);

      navigate("/admin/blog");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "E-mail ou senha inválidos";

      setError(message);
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // INTERFACE
  // ----------------------------------------------------------

  return (
    <main
      className="
        min-h-screen
        w-full
        flex
        items-center
        justify-center
        p-4
        relative
        overflow-hidden
        bg-[linear-gradient(135deg,#004AAD_0%,#004AAD_50%,#E30613_50%,#E30613_100%)]
      "
    >

      {/* Elementos decorativos sutis */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          pointer-events-none
          opacity-10
          bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_30%)]
        "
      />

      {/* =====================================================
          CARD DE LOGIN
          ===================================================== */}

      <section
        className="
          relative
          z-10
          w-full
          max-w-md
          bg-white
          rounded-3xl
          shadow-2xl
          p-7
          sm:p-9
        "
      >

        {/* ===================================================
            LOGO CONSTRUBET
            =================================================== */}

        <div className="flex justify-center mb-6">
          <img
            src="/assets/logo.webp"
            alt="Construbet Materiais para Construção e Acabamentos"
            className="
              w-auto
              max-w-[210px]
              h-auto
              object-contain
            "
          />
        </div>

        {/* ===================================================
            TÍTULO
            =================================================== */}

        <div className="text-center mb-7">
          <h1
            className="
              text-xl
              sm:text-2xl
              font-bold
              text-[#004AAD]
            "
          >
            Acesso administrativo
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gerenciamento do Blog Construbet
          </p>
        </div>

        {/* ===================================================
            FORMULÁRIO
            =================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* ERRO */}

          {error && (
            <div
              role="alert"
              className="
                flex
                items-start
                gap-2
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-3
                py-3
                text-sm
                text-red-700
              "
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {/* =================================================
              E-MAIL
              ================================================= */}

          <div>
            <label
              htmlFor="email"
              className="
                block
                mb-2
                text-sm
                font-medium
                text-gray-700
              "
            >
              E-mail
            </label>

            <div className="relative">

              <Mail
                size={18}
                aria-hidden="true"
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  pointer-events-none
                "
              />

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={loading}
                placeholder="seu@email.com"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  py-3
                  pl-10
                  pr-4
                  text-sm
                  text-gray-800
                  outline-none
                  transition
                  focus:border-[#004AAD]
                  focus:ring-2
                  focus:ring-[#004AAD]/20
                  disabled:cursor-not-allowed
                  disabled:bg-gray-100
                "
              />

            </div>
          </div>

          {/* =================================================
              SENHA
              ================================================= */}

          <div>
            <label
              htmlFor="senha"
              className="
                block
                mb-2
                text-sm
                font-medium
                text-gray-700
              "
            >
              Senha
            </label>

            <div className="relative">

              <Lock
                size={18}
                aria-hidden="true"
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  pointer-events-none
                "
              />

              <input
                id="senha"
                name="senha"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={senha}
                onChange={(event) =>
                  setSenha(event.target.value)
                }
                disabled={loading}
                placeholder="••••••••"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  py-3
                  pl-10
                  pr-12
                  text-sm
                  text-gray-800
                  outline-none
                  transition
                  focus:border-[#004AAD]
                  focus:ring-2
                  focus:ring-[#004AAD]/20
                  disabled:cursor-not-allowed
                  disabled:bg-gray-100
                "
              />

              <button
                type="button"
                aria-label={
                  showPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                disabled={loading}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  p-1
                  text-gray-400
                  transition
                  hover:text-[#004AAD]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>
          </div>

          {/* =================================================
              CAPTCHA
              ================================================= */}

          <div>
            <label
              htmlFor="captcha"
              className="
                block
                mb-2
                text-sm
                font-medium
                text-gray-700
              "
            >
              Quanto é{" "}
              <strong className="text-[#004AAD]">
                {numberWords[num1]}
              </strong>{" "}
              {getOperatorSymbol()}{" "}
              <strong className="text-[#004AAD]">
                {numberWords[num2]}
              </strong>
              ?
            </label>

            <div className="relative">

              <input
                id="captcha"
                name="captcha"
                type="number"
                inputMode="numeric"
                value={captchaInput}
                onChange={(event) =>
                  setCaptchaInput(event.target.value)
                }
                disabled={loading}
                placeholder="Digite o resultado"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  py-3
                  pl-4
                  pr-12
                  text-sm
                  text-gray-800
                  outline-none
                  transition
                  focus:border-[#004AAD]
                  focus:ring-2
                  focus:ring-[#004AAD]/20
                  disabled:cursor-not-allowed
                  disabled:bg-gray-100
                "
              />

              <button
                type="button"
                aria-label="Gerar novo desafio"
                onClick={generateCaptcha}
                disabled={loading}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  p-1
                  text-gray-400
                  transition
                  hover:text-[#004AAD]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <RefreshCw size={18} />
              </button>

            </div>
          </div>

          {/* =================================================
              BOTÃO
              ================================================= */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-xl
              bg-[#004AAD]
              py-3
              text-sm
              font-semibold
              text-white
              shadow-md
              transition-all
              duration-200
              hover:bg-[#003D8A]
              hover:shadow-lg
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>

        {/* ===================================================
            RODAPÉ
            =================================================== */}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Construbet • Materiais para Construção e Acabamentos
          </p>
        </div>

      </section>
    </main>
  );
}

