"use client"
import Link from "next/link"
import { SubmitHandler, useForm } from "react-hook-form"

interface FormData {
	username: string
	password: string
	confirmPassword: string
}

export default function Register() {
	const {
		register,
		watch,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>()

	const onSubmit: SubmitHandler<FormData> = (data: FormData) => {
		console.log("Form submitted:", data)
	}

	return (
		<div className="w-full max-w-md p-8">
			<form
				className="flex flex-col gap-4 w-full"
				onSubmit={handleSubmit(onSubmit)}
			>
				<h1 className="font-semibold text-3xl">Criar Perfil</h1>
				<label className="flex flex-col gap-2 w-full">
					Identificador Anônimo
					<input
						{...register("username", {
							required: "O identificador é obrigatório",
							pattern: {
								value: /^[a-zA-Z0-9_]{3,20}$/,
								message:
									"O identificador deve ter entre 3 a 20 caracteres e conter apenas letras, números e sublinhados.",
							},
						})}
						placeholder="Ex: anonimo_dds"
						type="text"
						name="username"
						className="w-full bg-white rounded-md px-4 py-2 outline-none"
					/>
				</label>
				{errors.username && (
					<p className="text-red-500 text-sm">{errors.username.message}</p>
				)}

				<label className="flex flex-col gap-2 w-full">
					Palavra-passe
					<input
						{...register("password", {
							required: "A palavra-passe é obrigatória",
							minLength: {
								value: 8,
								message: "A palavra-passe deve ter pelo menos 8 caracteres.",
							},
						})}
						type="password"
						name="password"
						placeholder="*********"
						className="w-full bg-white rounded-md px-4 py-2 outline-none"
					/>
				</label>
				{errors.password && (
					<p className="text-red-500 text-sm">{errors.password.message}</p>
				)}

				<label className="flex flex-col gap-2 w-full">
					Confirmar palavra-passe
					<input
						{...register("confirmPassword", {
							required: "A confirmação da palavra-passe é obrigatória",
							validate: (value) =>
								value === watch("password") ||
								"As palavras-passe não coincidem",
						})}
						type="password"
						name="confirmPassword"
						placeholder="*********"
						className="w-full bg-white rounded-md px-4 py-2 outline-none"
					/>
				</label>

				{errors.confirmPassword && (
					<p className="text-red-500 text-sm">
						{errors.confirmPassword.message}
					</p>
				)}

				<div className="flex flex-col w-full">
					<button
						type="submit"
						className="bg-[#1E1E1E] text-white px-4 py-2 rounded-md hover:bg-[#333333] transition-colors duration-300 cursor-pointer w-full"
					>
						Criar
					</button>

					<Link
						href="/login"
						className="text-center text-[#1E1E1E] mt-2 hover:underline"
					>
						Já tem uma conta?{" "}
						<span className="font-semibold hover:text-[#333333] transition-colors duration-300">
							Entrar
						</span>
					</Link>
				</div>
			</form>
		</div>
	)
}
