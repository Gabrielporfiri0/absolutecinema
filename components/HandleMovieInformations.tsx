import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { MovieFormData, Movies, MovieSchema } from "@/types/movies";
import { Button } from "./ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { fileUploadService } from "@/services/file-upload";
import { movieService } from "@/services/movie";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { validateImage } from "@/utils/imageUtils";

export default function handleMovieInformation() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [initialMovieData, setInitialMovieData] = useState<Movies>()

    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors, dirtyFields, isSubmitting, isDirty },
        setValue,
        trigger,
        reset,
        // watch
    } = useForm<MovieFormData>({
        resolver: zodResolver(MovieSchema),
        defaultValues: {
            title: '',
            movie_genre: '',
            synopsis: '',
            duration: '',
            photo: ''
        }
    })

    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                const response = await movieService.get()

                if (response.status === 200 && response.data.movies__.length > 0) {
                    const movieData = response.data.movies__[0]
                    setInitialMovieData(movieData)
                    // setValue('photo', movieData.photo)

                    reset({
                        title: movieData.title || '',
                        movie_genre: movieData.movie_genre || '',
                        synopsis: movieData.synopsis || '',
                        duration: movieData.duration || '',
                        photo: movieData.photo || '',
                    })
                }
            } catch (error) {
                if (isAxiosError(error) && error.response) {
                    switch (error.response.status) {
                        case 401:
                            toast.error('Token inválido. Faça login novamente.')
                            router.push('/')
                            break
                        case 500:
                            toast.error('Erro interno no servidor ao buscar dados do filme!! Tente novamente mais tarde.')
                            break
                        default:
                            toast.error('Erro desconhecido ao buscar dados do filme. Tente novamente mais tarde.')
                    }
                } else {
                    toast.error('Erro desconhecido ao buscar dados do filme. Tente novamente mais tarde.')
                }
            }
        }

        fetchMovieData();
    }, []);

    // const photoFile = watch('photo')

    // function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    //     const files = e.target.files;

    //     if (files && files.length > 0) {
    //         const file = files[0];
    //         setValue('photo', file); // Define o valor como File
    //         setSelectedFile(file);
    //         trigger('photo'); // Dispara validação
    //     }
    // }

    async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const error = await validateImage(file);

        if (error) {
            toast.error(error);
            e.target.value = "";
            return;
        }

        setSelectedFile(file);
        setValue('photo', URL.createObjectURL(file)); // Define o valor como URL para pré-visualização
        trigger('photo'); // Dispara validação
    }

    // // Função para limpar o arquivo
    // const clearFile = () => {
    //     setValue('photo', undefined);
    //     setSelectedFile(null);
    // }

    const removeImageFromCloudinary = async (imageUrl: string) => {
        try {
            const response = await fileUploadService.deleteImage(imageUrl)

            if (response.status === 200) {
                toast.success('Imagem antiga removida com sucesso!')
                return true
            } else {
                toast.error('Erro ao remover imagem antiga do filme. Tente novamente atualizar os dados do filme mais tarde.')
                return false
            }
        } catch (error) {
            console.log('Erro ao remover imagem antiga do Cloudinary: ', error)
            toast.error('Erro ao remover imagem antiga do filme. Tente novamente atualizar os dados do filme mais tarde.')
            return false
        }
    }

    const onSubmit = async (data: MovieFormData) => {
        // if (!data.photo || !selectedFile) {
        //     toast.error("Por favor, selecione uma imagem");
        //     return;
        // }

        if (!selectedFile && !initialMovieData?.photo) {
            toast.error("Por favor, selecione uma imagem");
            return;
        }

        if (initialMovieData) {
            // Lógica para atualizar o filme existente

            const hasChangedThePhoto = dirtyFields.photo

            if (!hasChangedThePhoto) {
                try {
                    const response = await movieService.update(String(initialMovieData._id), {
                        ...data,
                        photo: initialMovieData.photo,
                    }, initialMovieData.createdAt, initialMovieData.updatedAt)

                    console.log('Resposta da atualização do filme: ', response)

                    if (response.status === 200) toast.success('Dados do filme atualizados com sucesso!!!')
                } catch (error) {
                    if (isAxiosError(error) && error.response) {
                        switch (error.response.status) {
                            case 422:
                                toast.error('ID do filme informado é inválido.')
                                break
                            case 404:
                                toast.error('Filme não encontrado. Atualização dos dados do filme falhou.')
                                break
                            case 401:
                                toast.error('Token inválido. Faça login novamente.')
                                router.push('/')
                                break
                            case 400:
                                toast.error('Por favor, forneça todos os dados necessários para atualizar o filme.')
                                break
                            case 500:
                                toast.error('Erro interno no servidor ao atualizar dados do filme!! Tente novamente mais tarde.')
                                break
                            default:
                                toast.error('Erro desconhecido ao atualizar dados do filme. Tente novamente mais tarde.')
                        }
                    } else {
                        toast.error('Erro desconhecido ao atualizar dados do filme. Tente novamente mais tarde.')
                    }
                }
                return
            } else {

                if (!selectedFile) {
                    toast.error("Por favor, selecione uma imagem");
                    return;
                }

                try {
                    let oldImageUrl = initialMovieData.photo

                    const isOldImageRemovedFromCloudinary = await removeImageFromCloudinary(String(oldImageUrl))

                    if (isOldImageRemovedFromCloudinary) {
                        const uploadedUrl = await fileUploadService.uploadImage(selectedFile)
                        const response = await movieService.update(String(initialMovieData._id), {
                            ...data,
                            photo: uploadedUrl,
                        }, initialMovieData.createdAt, initialMovieData.updatedAt)

                        console.log('Resposta da atualização do filme: ', response)

                        if (response.status === 200) toast.success('Dados do filme atualizados com sucesso!!!')
                    } else {
                        toast.error('Erro ao atualizar os dados do filme devido a um problema com a imagem. Tente novamente mais tarde.')
                    }
                } catch (error) {
                    if (isAxiosError(error) && error.response) {
                        switch (error.response.status) {
                            case 422:
                                toast.error('ID do filme informado é inválido.')
                                break
                            case 404:
                                toast.error('Filme não encontrado. Atualização dos dados do filme falhou.')
                                break
                            case 401:
                                toast.error('Token inválido. Faça login novamente.')
                                router.push('/')
                                break
                            case 400:
                                toast.error('Por favor, forneça todos os dados necessários para atualizar o filme.')
                                break
                            case 500:
                                toast.error('Erro interno no servidor ao atualizar dados do filme!! Tente novamente mais tarde.')
                                break
                            default:
                                toast.error('Erro desconhecido ao atualizar dados do filme. Tente novamente mais tarde.')
                        }
                    } else {
                        toast.error('Erro desconhecido ao atualizar dados do filme. Tente novamente mais tarde.')
                    }
                }
            }
        }
        else {
            // Lógica para criar um novo filme

            if (!selectedFile) {
                toast.error("Por favor, selecione uma imagem");
                return;
            }

            try {
                let imageUrl = selectedFile

                const uploadedUrl = await fileUploadService.uploadImage(imageUrl)

                const response = await movieService.create({
                    ...data,
                    photo: uploadedUrl
                })

                console.log('Resposta da criação do filme: ', response)

                if (response.status === 201) toast.success('Dados do filme cadastrados com sucesso!!!')
            } catch (error) {
                if (isAxiosError(error) && error.response) {
                    switch (error.response.status) {
                        case 422:
                            toast.error('Já existe um filme cadastrado!!')
                            break
                        case 401:
                            toast.error('Token inválido. Faça login novamente.')
                            router.push('/')
                            break
                        case 400:
                            toast.error('Por favor, forneça todos os dados necessários para cadastrar o filme.')
                            break
                        case 500:
                            toast.error('Erro interno no servidor ao adicionar filme!! Tente novamente mais tarde.')
                            break
                        default:
                            toast.error('Erro desconhecido ao criar filme. Tente novamente mais tarde.')
                    }
                } else {
                    toast.error('Erro desconhecido ao criar filme. Tente novamente mais tarde.')
                }
            }
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                    />

                    {/* {selectedFile && (
                        <div className="mt-2">
                            <p className="text-sm">Prévia: {selectedFile.name}</p>
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="Preview"
                                className="mt-2 max-h-40 rounded"
                            />
                        </div>
                    )} */}

                    {(selectedFile || initialMovieData?.photo) && (
                        <div className="mt-2">
                            <p className="text-sm">
                                Prévia:
                            </p>

                            <img
                                src={
                                    selectedFile
                                        ? URL.createObjectURL(selectedFile)
                                        : initialMovieData?.photo
                                }
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

            <Button
                type="button"
                disabled={isSubmitting}
                className="hover:cursor-pointer"
            >
                Cancelar
            </Button>

            <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="hover:cursor-pointer"
            >
                {initialMovieData ? 'Atualizar' : 'Salvar'}
            </Button>
        </form>
    )
}