export default function FaleConoscoPage() {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Fale Conosco</h1>
        <p className="mb-8 text-gray-300">
          Tem alguma dúvida ou sugestão? Preencha o formulário abaixo.
        </p>
  
        <form className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium mb-2">
              Seu Nome
            </label>
            <input
              type="text"
              id="nome"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Seu Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label htmlFor="mensagem" className="block text-sm font-medium mb-2">
              Mensagem
            </label>
            <textarea
              id="mensagem"
              rows={5}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 p-3 rounded-md font-bold hover:bg-red-700 transition-colors"
          >
            Enviar Mensagem
          </button>
        </form>
      </div>
    );
  }