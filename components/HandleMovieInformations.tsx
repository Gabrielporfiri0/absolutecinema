import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";
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

export default function HandleMovieInformation() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [initialMovieData, setInitialMovieData] = useState<Movies>();

    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
            isDirty,
        },
        setValue,
        reset,
    } = useForm<MovieFormData>({
        resolver: zodResolver(MovieSchema),
        defaultValues: {
            title: "",
            movie_genre: "",
            synopsis: "",
            duration: "",
            photo: "",
        },
    });

    useEffect(() => {
        async function fetchMovieData() {
            try {
                const response = await movieService.get();

                if (response.status === 200 && response.data.movies__.length > 0) {
                    const movie = response.data.movies__[0];

                    setInitialMovieData(movie);

                    reset({
                        title: movie.title,
                        movie_genre: movie.movie_genre,
                        synopsis: movie.synopsis,
                        duration: movie.duration,
                        session_date: movie.session_date,
                        session_time: movie.session_time,
                        photo: movie.photo,
                    });
                } else if (response.status === 200 && response.data.movies__.length === 0) {
                    toast.error("Nenhum filme cadastrado ainda, preencha os dados para criar o primeiro!");
                } else {
                    toast.error("Erro desconhecido ao buscar dados do filme cadastrado, tente novamente mais tarde!");
                }
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 401) {
                    toast.error("Erro, sessão expirada, faça login novamente!");
                    localStorage.removeItem("accessToken");
                    router.push("/");
                } else {
                    toast.error("Erro desconhecido ao buscar dados do filme cadastrado, tente novamente mais tarde!");
                }
            }
        }

        fetchMovieData();
    }, [reset, router]);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(selectedFile);

        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [selectedFile]);

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

        setValue("photo", URL.createObjectURL(file), {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    async function removeImage(url: string) {
        try {
            const response = await fileUploadService.deleteImage(url);

            return response.status === 200;
        } catch {
            return false;
        }
    }

    async function uploadNewImage() {
        if (!selectedFile) return null;

        return fileUploadService.uploadImage(selectedFile);
    }

    async function onSubmit(data: MovieFormData) {
        try {
            if (!selectedFile && !initialMovieData?.photo) {
                toast.error("Selecione uma imagem!");
                return;
            }

            let finalPhoto = initialMovieData?.photo ?? "";

            const changedPhoto = !!selectedFile;

            if (changedPhoto) {
                if (initialMovieData?.photo) {
                    const removed = await removeImage(initialMovieData.photo);

                    if (!removed) {
                        toast.error("Erro ao remover imagem antiga, tente novamente mais tarde.");
                        return;
                    }
                }

                const uploaded = await uploadNewImage();

                if (!uploaded) {
                    toast.error("Erro ao fazer upload da imagem, tente novamente mais tarde.");
                    return;
                }

                finalPhoto = uploaded;
            }

            if (initialMovieData) {
                const response = await movieService.update(String(initialMovieData._id), {
                    ...data,
                    photo: finalPhoto,
                },
                    initialMovieData.createdAt,
                    initialMovieData.updatedAt
                );

                if (response.status === 200) {
                    toast.success("Dados do filme em cartaz atualizados com sucesso!");
                } else {
                    toast.error("Erro ao atualizar dados do filme em cartaz, tente novamente mais tarde.");
                }

                return;
            }

            const response = await movieService.create({
                ...data,
                photo: finalPhoto,
            });

            if (response.status === 201) {
                toast.success("Dados do filme em cartaz criados com sucesso!");

                reset();
                setSelectedFile(null);
                router.push('/')
            } else {
                toast.error("Erro ao criar dados do filme em cartaz, tente novamente mais tarde.");
            }
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                switch (error.response.status) {
                    case 400:
                        toast.error("Erro, dados inválidos!");
                        break;
                    case 401:
                        toast.error("Erro, sessão expirada, faça login novamente!");
                        localStorage.removeItem("accessToken");
                        router.push("/");
                        break;
                    case 404:
                        toast.error("Erro, filme não encontrado com ID fornecido!");
                        break;
                    case 422:
                        toast.error("Erro, ID inválido ou já existe um filme cadastrado!");
                        break;
                    case 500:
                        toast.error("Erro interno do servidor, tente novamente mais tarde!");
                        break;
                    default:
                        toast.error(`Erro desconhecido ao ${initialMovieData ? "atualizar" : "criar"} filme, tente novamente mais tarde!`);
                }
            } else {
                toast.error("Erro desconhecido ao processar a solicitação, tente novamente mais tarde!");
            }
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-xl mx-auto bg-zinc-800/80 backdrop-blur-sm rounded-2xl border border-zinc-700 shadow-2xl p-4 sm:p-6 space-y-5"
        >
            <div className="space-y-1.5">
                <label htmlFor="title" className="block text-sm font-medium text-zinc-300">
                    Título <span className="text-rose-400">*</span>
                </label>

                <Input
                    id="title"
                    {...register("title")}
                    placeholder="Digite o título do filme"
                    disabled={isSubmitting}
                    className="w-full bg-zinc-900/70 border-zinc-600 text-white placeholder:text-zinc-400 rounded-xl 
                   transition focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                   disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                />

                {errors.title && (
                    <span className="text-rose-400 text-xs sm:text-sm block pl-1">
                        {errors.title.message}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="movie_genre" className="block text-sm font-medium text-zinc-300">
                    Gênero <span className="text-rose-400">*</span>
                </label>

                <Input
                    id="movie_genre"
                    {...register("movie_genre")}
                    placeholder="Ex: Ação, Drama, Comédia"
                    disabled={isSubmitting}
                    className="w-full bg-zinc-900/70 border-zinc-600 text-white placeholder:text-zinc-400 rounded-xl 
                   transition focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                   disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                />

                {errors.movie_genre && (
                    <span className="text-rose-400 text-xs sm:text-sm block pl-1">
                        {errors.movie_genre.message}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="synopsis" className="block text-sm font-medium text-zinc-300">
                    Sinopse <span className="text-rose-400">*</span>
                </label>

                <Textarea
                    id="synopsis"
                    {...register("synopsis")}
                    placeholder="Descreva a história do filme..."
                    disabled={isSubmitting}
                    rows={4}
                    className="w-full bg-zinc-900/70 border-zinc-600 text-white placeholder:text-zinc-400 rounded-xl 
                   transition focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                   disabled:opacity-50 disabled:cursor-not-allowed resize-y text-sm sm:text-base"
                />

                {errors.synopsis && (
                    <span className="text-rose-400 text-xs sm:text-sm block pl-1">
                        {errors.synopsis.message}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="duration" className="block text-sm font-medium text-zinc-300">
                    Duração do filme (HH:MM) <span className="text-rose-400">*</span>
                </label>

                <Input
                    id="duration"
                    type="time"
                    {...register("duration")}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-900/70 border-zinc-600 text-white placeholder:text-zinc-400 rounded-xl 
                   transition focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                   disabled:opacity-50 disabled:cursor-not-allowed scheme-dark text-sm sm:text-base"
                />

                {errors.duration && (
                    <span className="text-rose-400 text-xs sm:text-sm block pl-1">
                        {errors.duration.message}
                    </span>
                )}
            </div>
            
            <div className="space-y-1.5">
                <label htmlFor="duration" className="block text-sm font-medium text-zinc-300">
                    Data da sessão (DD/MM/AAAA) <span className="text-rose-400">*</span>
                </label>

                <Input
                    id="session_date"
                    type="date"
                    {...register("session_date")}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-900/70 border-zinc-600 text-white placeholder:text-zinc-400 rounded-xl 
                   transition focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                   disabled:opacity-50 disabled:cursor-not-allowed scheme-dark text-sm sm:text-base"
                />

                {errors.session_date && (
                    <span className="text-rose-400 text-xs sm:text-sm block pl-1">
                        {errors.session_date.message}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="duration" className="block text-sm font-medium text-zinc-300">
                    Horário da sessão (HH:MM) <span className="text-rose-400">*</span>
                </label>

                <Input
                    id="session_time"
                    type="time"
                    {...register("session_time")}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-900/70 border-zinc-600 text-white placeholder:text-zinc-400 rounded-xl 
                   transition focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                   disabled:opacity-50 disabled:cursor-not-allowed scheme-dark text-sm sm:text-base"
                />

                {errors.session_time && (
                    <span className="text-rose-400 text-xs sm:text-sm block pl-1">
                        {errors.session_time.message}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="photo" className="block text-sm font-medium text-zinc-300">
                    Pôster do filme <span className="text-rose-400">*</span>
                </label>

                <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={isSubmitting}
                    className="w-full text-sm text-zinc-200 
                   file:mr-4 file:py-2 file:px-4 
                   file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                   file:bg-purple-600 file:text-white file:hover:bg-purple-700 
                   file:transition file:cursor-pointer 
                   disabled:opacity-50 
                   bg-zinc-900/70 border-zinc-600 rounded-xl
                   h-10
                   leading-tight
                   file:h-full"
                />

                {errors.photo && (
                    <span className="text-rose-400 text-xs sm:text-sm block pl-1">
                        {errors.photo.message}
                    </span>
                )}
            </div>

            {(previewUrl || initialMovieData?.photo) && (
                <div className="flex justify-center pt-2">
                    <img
                        src={previewUrl ?? initialMovieData?.photo}
                        alt="Pré-visualização do poster"
                        className="max-h-48 rounded-lg border border-zinc-600 shadow-md object-cover hover:scale-105 transition-transform duration-200"
                    />
                </div>
            )}

            <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className={`
        w-full py-2.5 font-semibold rounded-xl transition-all duration-200 text-sm sm:text-base hover:cursor-pointer
        ${isSubmitting || !isDirty
                        ? "bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-60"
                        : "bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-purple-500/30 active:scale-[0.98]"
                    }
      `}
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {initialMovieData ? "Atualizando..." : "Salvando..."}
                    </span>
                ) : (
                    initialMovieData ? "Atualizar dados do filme" : "Salvar dados do filme"
                )}
            </Button>
        </form>
    );
}