import { useState } from 'react';

export default function HelpCenter() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    { question: '¿Qué pasa si olvido mi contraseña?', answer: 'Ve a la pantalla de inicio, haz clic en \'¿Olvidaste tu contraseña?\' y sigue las instrucciones que enviamos a tu correo.' },
    { question: '¿Por qué mi cuenta aparece como bloqueada?', answer: 'Después de 5 intentos fallidos, el sistema de seguridad de Kiora suspende temporalmente tu cuenta. Un administrador puede desbloquearla en el Panel.' },
    { question: '¿Cómo puedo cambiar el idioma de la aplicación?', answer: 'Puedes usar el botón ubicado en la esquina inferior derecha de la pantalla para alternar entre Español e Inglés en cualquier momento.' },
    { question: 'Guía: ¿Cómo iniciar sesión en el sistema?', answer: 'Para entrar a Kiora, dirígete a la página de ingreso, escribe tu correo y contraseña registrados y presiona "Iniciar sesión".' },
    { question: 'Guía: ¿Cómo escoger un pedido o producto?', answer: 'Una vez en la aplicación, navega a través del catálogo o las categorías. Cuando encuentres lo que quieres, selecciónalo y presiona el botón para añadirlo a tu carrito.' },
    { question: 'Guía: ¿Cómo pagar mi pedido?', answer: 'Tras elegir tus productos, dirígete a tu carrito, revisa el resumen de tu compra y pulsa en "Pagar". Luego, sigue los pasos seleccionando tu medio de pago.' },
    { question: 'Guía: ¿Cómo hacer seguimiento a mi compra?', answer: 'Dirígete al apartado de "Mis Pedidos" desde tu panel para ver en qué estado se encuentra tu comida o servicio.' },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="bg-white w-full max-w-2xl p-8 rounded-xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#1e293b]">Centro de Ayuda y Preguntas</h2>
          <p className="text-[#64748b] mt-2">Encuentra respuestas rápidas a problemas comunes</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                className="w-full px-5 py-4 text-left font-semibold text-[#334155] bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
                onClick={() => toggleFaq(idx)}
              >
                {faq.question}
                <svg 
                  className={`w-5 h-5 transform transition-transform text-gray-500 ${openIndex === idx ? 'rotate-180 text-[#ec131e]' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div 
                className={`px-5 text-[#475569] bg-white transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === idx ? 'py-4 max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ec131e] hover:bg-[#d0111a] text-white rounded-lg font-semibold transition-colors shadow-sm no-underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Inicio
          </a>
        </div>

      </div>
    </div>
  );
}
