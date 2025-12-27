import { useState } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { MovieFormData, MovieSchema } from "@/types/movies";
import { Button } from "./ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { fileUploadService } from "@/services/file-upload";
import { movieService } from "@/services/movie";
import { localStorageUtil } from "@/lib/localStorage_";
import { useRouter } from "next/navigation";

export default function handleMovieInformation() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        trigger,
        // watch
    } = useForm<MovieFormData>({
        resolver: zodResolver(MovieSchema),
    })

    // const photoFile = watch('photo')

    function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        
        if (files && files.length > 0) {
            const file = files[0];
            setValue('photo', file); // Define o valor como File
            setSelectedFile(file);
            trigger('photo'); // Dispara validação
        } 
    }

    // // Função para limpar o arquivo
    // const clearFile = () => {
    //     setValue('photo', undefined);
    //     setSelectedFile(null);
    // }

    const onSubmit = async (data: MovieFormData) => {
        if (!data.photo) {
            toast.error("Por favor, selecione uma imagem");
            return;
        }

        const accessToken_ = localStorageUtil.getItem('acessToken')

        if(accessToken_){
            try {
                let imageUrl = data.photo
    
                console.log('ON SUBMIT: ', imageUrl)
    
                const uploadedUrl = await fileUploadService.uploadImage(imageUrl, accessToken_)

                const response = await movieService.create({
                    ...data,
                    photo: uploadedUrl
                }, accessToken_)
                
                if(response.status === 201) toast.success('Dados do filme cadastrados com sucesso!!!')
            } catch (error) {
                console.log('Erro: ', error);
                toast.error("Erro ao criar filme");
            }
        } else {
            toast.error('Sessão não encontrada. Faça login novamente.')
            router.push('/')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 items-center">
            <div className="flex w-full justify-center gap-4">
                <div className="flex flex-col w-[40%] items-center gap-2">
                    <Label htmlFor="string">Título</Label>
                    <Input
                        type="text"
                        {...register('title')}
                    />

                    {errors.title && (
                        <span className="text-[rgb(238, 80, 80)] text-sm ml-2.5">
                            {errors.title.message}
                        </span>
                    )}
                </div>

                <div className="flex flex-col w-[40%] items-center gap-2">
                    <Label htmlFor="string">Gênero</Label>
                    <Input
                        type="text"
                        {...register('movie_genre')}
                    />

                    {errors.movie_genre && (
                        <span className="text-[rgb(238, 80, 80)] text-sm ml-2.5">
                            {errors.movie_genre.message}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center w-[60%] gap-2">
                <Label htmlFor="string">Sinopse</Label>
                <Textarea
                    {...register('synopsis')}
                />

                {errors.synopsis && (
                    <span className="text-[rgb(238, 80, 80)] text-sm ml-2.5">
                        {errors.synopsis.message}
                    </span>
                )}

                <div className="flex flex-col gap-2 items-center w-[20%]">
                    <Label htmlFor="time">Duração</Label>
                    <Input
                        type="time"
                        {...register('duration')}
                    />

                    {errors.duration && (
                        <span className="text-[rgb(238, 80, 80)] text-sm ml-2.5">
                            {errors.duration.message}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex w-full justify-center gap-6">
                <div className="flex flex-col gap-2 items-center w-[40%]">
                    <Label htmlFor="file">Imagem</Label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hover:cursor-pointer"
                    />

                    {selectedFile && (
                        <div className="mt-2">
                            <p className="text-sm">Prévia: {selectedFile.name}</p>
                            <img 
                                src={URL.createObjectURL(selectedFile)} 
                                alt="Preview" 
                                className="mt-2 max-h-40 rounded"
                            />
                        </div>
                    )}

                    {errors.photo && (
                        <span className="text-[rgb(238, 80, 80)] text-sm ml-2.5">
                            {errors.photo.message}
                        </span>
                    )}
                </div>
            </div>

            <Button>
                Cancelar
            </Button>

            <Button type="submit">
                Salvar
            </Button>
        </form>
    )
}