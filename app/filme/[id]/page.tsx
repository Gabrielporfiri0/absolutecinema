import SeatPicker from "../../../components/SeatPicker";

export default function FilmePage({ params }: { params: { id: string } }) {
  return (
    
    <div 
      className="min-h-screen bg-[url('/fundo_ingressos.jpg')] bg-cover bg-center bg-no-repeat"
    >
      <div className="w-full min-h-screen h-full bg-black/80 py-10">
        
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-white mb-8">
            Escolha seus assentos
          </h1>

          <div className="w-full max-w-3xl mx-auto bg-gray-900/50 p-4 rounded-md mb-8 backdrop-blur-sm border border-gray-800">

            <div className="bg-gradient-to-b from-gray-300 to-gray-500 h-3 rounded-full w-3/4 mx-auto shadow-[0_10px_20px_-5px_rgba(255,255,255,0.3)]"></div>
            <p className="text-center text-gray-300 mt-4 text-sm tracking-widest">TELA</p>
          </div>
          
          <SeatPicker />
        </div>

      </div>
    </div>
  );
}