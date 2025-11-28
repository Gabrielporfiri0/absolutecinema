import SeatPicker from "../../components/SeatPicker";



export default function FilmePage({ params }: { params: { id: string } }) {
  


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center my-8">
        Escolha seus assentos
      </h1>
      
      {/* (Opcional) Mostrar qual filme está sendo visto */}
      <p className="text-center text-xl text-red-500 mb-4">
        Você está vendo o filme ID: {params.id}
      </p>

      {/* Tela do Cinema */}
      <div className="w-full max-w-3xl mx-auto bg-black p-4 rounded-md mb-4">
        <div className="bg-gray-400 h-2 rounded-full w-3/4 mx-auto shadow-inner shadow-gray-700"></div>
        <p className="text-center text-gray-300 mt-2 text-sm">TELA</p>
      </div>
      
      {/* 2. AQUI É ONDE O COMPONENTE É USADO */}
      <SeatPicker />
    </div>
  );
}