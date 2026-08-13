import { Phone, Mail, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-800 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* LOGO + DESCRIÇÃO */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black tracking-tighter text-[#004AAD]">
                Mapa
              </span>
              <span className="text-3xl font-black tracking-[-0.04em] bg-gradient-to-r from-[#004AAD] to-[#2535FB] bg-clip-text text-transparent">
                PSI
              </span>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed max-w-md">
            Autoconhecimento profundo através da psicanálise. 
            Descubra seu Mapa PSI e transforme sua vida emocional, 
            pessoal e profissional.
          </p>

          <div className="flex items-center gap-2 mt-8 text-sm text-gray-500">
            <Heart className="text-red-500" size={18} />
            <span>Desenvolvido com propósito</span>
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <div>
          <h4 className="text-lg font-semibold mb-6 text-gray-900">Navegação</h4>
          <ul className="space-y-3 text-gray-600">
            <li>
              <a href="/" className="hover:text-[#004AAD] transition-colors">Início</a>
            </li>
            <li>
              <a href="#como-funciona" className="hover:text-[#004AAD] transition-colors">Como Funciona</a>
            </li>
            <li>
              <a href="#beneficios" className="hover:text-[#004AAD] transition-colors">Benefícios</a>
            </li>
        
          
          </ul>
        </div>

        {/* CONTATO */}
        <div>
          <h4 className="text-lg font-semibold mb-6 text-gray-900">Entre em contato</h4>
          
          <ul className="space-y-5 text-gray-600">
            <li className="flex items-start gap-3">
              <Phone className="text-[#004AAD] mt-1" size={20} />
              <div>
                <a 
                  href="https://wa.me/5531991073303" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#004AAD] transition-colors"
                >
                  (31) 9 9999-9999
                </a>
                <p className="text-xs text-gray-500 mt-0.5">WhatsApp • Resposta rápida</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Mail className="text-[#004AAD] mt-1" size={20} />
              <a 
                href="mailto:contato@mapapsi.com.br" 
                className="hover:text-[#004AAD] transition-colors"
              >
                contato@mapapsi.com.br
              </a>
            </li>
          </ul>

          <a
            href="//questionario"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center w-full gap-3 bg-blue-700/80 hover:bg-blue-700/90 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-md"
          >
            <Phone size={20} />
            Fazer meu Mapa PSI agora
          </a>
        </div>
      </div>

      {/* BARRA FINAL */}
      <div className="border-t border-gray-200 mt-16 pt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>
            © {new Date().getFullYear()} Mapa PSI — Todos os direitos reservados.
          </span>

          <div className="flex gap-6">
            <Link
              to="/politicas"
              className="hover:text-gray-700 transition-colors"
            >
              Política de Privacidade
            </Link>
            <a href="/termos" className="hover:text-gray-700 transition-colors">
              Termos de Uso
            </a>
          </div>

          <span className="text-xs">Desenvolvido com foco em transformação humana</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;