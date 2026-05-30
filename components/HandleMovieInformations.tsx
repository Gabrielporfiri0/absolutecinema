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
import { Checkbox } from "./ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Trash2 } from "lucide-react";

export default function HandleMovieInformation() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [initialMovieData, setInitialMovieData] = useState<Movies>();
    const [checkboxState, setCheckBoxState] = useState(false)

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
                    toast.error("Ainda não há um filme em cartaz, preencha os dados para criar um!");
                } else {
                    toast.error("Erro desconhecido ao buscar dados do filme em cartaz, tente novamente mais tarde!");
                }
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 401) {
                    toast.error("Erro, sessão expirada, faça login novamente!");
                    localStorage.removeItem("accessToken");
                    router.push("/");
                } else {
                    toast.error("Erro desconhecido ao buscar dados do filme em cartaz, tente novamente mais tarde!");
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
                        toast.error("Erro ao tentar remover imagem do pôster antigo, tente novamente mais tarde.");
                        return;
                    }
                }

                const uploaded = await uploadNewImage();

                if (!uploaded) {
                    toast.error("Erro ao fazer upload do novo pôster, tente novamente mais tarde.");
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
                toast.success("Dados do filme em cartaz atualizados com sucesso!");

                reset();
                setSelectedFile(null);
                router.push('/')
            } else {
                toast.error("Erro ao atualizar dados do filme em cartaz, tente novamente mais tarde.");
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
                        toast.error("Erro, dados do filme em cartaz não encontrados com o ID fornecido!");
                        break;
                    case 422:
                        toast.error("Erro, ID inválido ou já existe um filme em cartazcom dados cadastrados!");
                        break;
                    case 500:
                        toast.error("Erro interno do servidor, tente novamente mais tarde!");
                        break;
                    default:
                        toast.error(`Erro desconhecido ao atualizar dados do filme em cartaz, tente novamente mais tarde!`);
                        break;
                }
            } else {
                toast.error("Erro desconhecido ao processar a solicitação, tente novamente mais tarde!");
            }
        }
    }

    useEffect(() => {
        if (!checkboxState && previewUrl) {
            setSelectedFile(null)
            setPreviewUrl(null)
        }
    }, [checkboxState])

    function handleRemovePreviewImage() {
        setSelectedFile(null);
        setPreviewUrl(null);

        if (!initialMovieData) {
            setValue("photo", "", {
                shouldDirty: true,
                shouldValidate: true,
            });
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
                   disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base selection:bg-blue-700 selection:text-white"
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
                   disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base selection:bg-blue-700 selection:text-white"
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
                   disabled:opacity-50 disabled:cursor-not-allowed scheme-dark text-sm sm:text-base selection:bg-blue-700 selection:text-white"
                />

                {errors.duration && (
                    <span className="text-rose-400 text-xs sm:text-sm block pl-1">
                        {errors.duration.message}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="duration" className="block text-sm font-medium text-zinc-300">
                    Data da exibição do filme (DD/MM/AAAA) <span className="text-rose-400">*</span>
                </label>

                <Input
                    id="session_date"
                    type="date"
                    {...register("session_date")}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-900/70 border-zinc-600 text-white placeholder:text-zinc-400 rounded-xl 
                   transition focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                   disabled:opacity-50 disabled:cursor-not-allowed scheme-dark text-sm sm:text-base selection:bg-blue-700 selection:text-white"
                />

                {errors.session_date && (
                    <span className="text-rose-400 text-xs sm:text-sm block pl-1">
                        {errors.session_date.message}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="duration" className="block text-sm font-medium text-zinc-300">
                    Horário da exibição do filme (HH:MM) <span className="text-rose-400">*</span>
                </label>

                <Input
                    id="session_time"
                    type="time"
                    {...register("session_time")}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-900/70 border-zinc-600 text-white placeholder:text-zinc-400 rounded-xl 
                   transition focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                   disabled:opacity-50 disabled:cursor-not-allowed scheme-dark text-sm sm:text-base selection:bg-blue-700 selection:text-white"
                />

                {errors.session_time && (
                    <span className="text-rose-400 text-xs sm:text-sm block pl-1">
                        {errors.session_time.message}
                    </span>
                )}
            </div>

            <div className="space-y-5">
                <div className="space-y-1.5">
                    <label
                        htmlFor="photo"
                        className="block text-sm font-medium text-zinc-200"
                    >
                        Pôster do filme{" "}
                        <span className="text-rose-400">*</span>
                    </label>

                    <p className="text-xs text-zinc-400">
                        Envie uma imagem para o pôster do filme.
                    </p>
                </div>

                {initialMovieData && (
                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4">
                        <FieldGroup>
                            <Field orientation="horizontal" className="gap-3">
                                <Checkbox
                                    checked={checkboxState}
                                    onCheckedChange={() =>
                                        setCheckBoxState(!checkboxState)
                                    }
                                    id="change-movie-photo"
                                    name="change-movie-photo"
                                    className="
                                        data-[state=checked]:bg-purple-600
                                        data-[state=checked]:border-purple-600
                                        hover:cursor-pointer
                                    "
                                    disabled={isSubmitting}
                                />

                                <FieldLabel
                                    htmlFor="change-movie-photo"
                                    className="cursor-pointer text-sm text-zinc-300"
                                >
                                    Deseja trocar o pôster do filme atual?
                                </FieldLabel>
                            </Field>
                        </FieldGroup>
                    </div>
                )}

                {(!initialMovieData || checkboxState) && (
                    <div
                        className="
                            relative overflow-hidden rounded-2xl
                            border border-dashed border-zinc-600
                            bg-zinc-900/60
                            transition-all duration-200
                            hover:border-purple-500
                            hover:bg-zinc-900
                            focus-within:border-purple-500
                            focus-within:ring-2
                            focus-within:ring-purple-500/30
                        "
                    >
                        <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            disabled={isSubmitting}
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                        />

                        <div className="flex min-h-28 flex-col items-center justify-center gap-3 px-4 py-6 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20 shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-purple-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 15a4 4 0 014-4h1m4-4h1a4 4 0 014 4m-4 4l-4-4m0 0l-4 4m4-4v12"
                                    />
                                </svg>
                            </div>

                            <div className="space-y-1 max-w-full">
                                <p className="text-sm font-medium text-zinc-200">
                                    Clique para enviar uma imagem
                                </p>

                                <p className="text-xs text-zinc-500">
                                    PNG, JPG, JPEG ou WEBP
                                </p>

                                {selectedFile && (
                                    <p className="max-w-62.5 truncate text-xs text-purple-400 font-medium mx-auto">
                                        {selectedFile.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {errors.photo && (
                    <span className="block pl-1 text-sm text-rose-400">
                        {errors.photo.message}
                    </span>
                )}

                {(previewUrl || initialMovieData?.photo) && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="block text-sm font-medium text-zinc-300">
                                Pré-visualização
                            </span>

                            {previewUrl && (
                                <Button
                                    type="button"
                                    onClick={handleRemovePreviewImage}
                                    className="
                                        flex items-center gap-2
                                        rounded-lg border border-rose-500/30
                                        text-white
                                        bg-rose-400
                                        px-3 py-1.5
                                        text-xs font-medium
                                        transition-all duration-200
                                        hover:bg-rose-500
                                        hover:border-rose-500
                                        active:scale-95 hover:cursor-pointer
                                    "
                                    disabled={isSubmitting}
                                    variant={'destructive'}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Remover imagem
                                </Button>
                            )}
                        </div>

                        <div className="flex justify-center">
                            <div className="group overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-xl">
                                <img
                                    src={previewUrl ?? initialMovieData?.photo}
                                    alt="Pré-visualização do poster"
                                    className="max-h-80 w-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                <div className="inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-4 py-3">
                                    <p className="text-xs text-zinc-300">
                                        Prévia do pôster
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className={`w-full py-2.5 font-semibold rounded-xl transition-all duration-200 text-sm sm:text-base hover:cursor-pointer
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