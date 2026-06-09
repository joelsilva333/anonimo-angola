"use client"

import { api } from "@/app/api/config"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast, ToastContainer } from "react-toastify"
import Cookies from "universal-cookie"

interface FormData {
	username: string
	password: string
}

export default function Login() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>()

	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const cookies = new Cookies()

	const onSubmit: SubmitHandler<FormData> = async (data) => {
		try {
			setLoading(true)
			const response = await api.post("/auth/login", {
				anon_name: data.username,
				password: data.password,
			})

			if (response.status === 200) {
				const { token } = response.data
				const userData = JSON.stringify(response.data.user)

				localStorage.setItem("user_data", userData)

				cookies.set("aa_token", token, { path: "/", maxAge: 60 * 60 * 24 * 7 })

				router.push("/home")
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.error ||
				"Erro ao fazer login. Por favor, tente novamente."
			toast.error(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="w-full max-w-md lg:p-8 px-8 py-4">
			<ToastContainer />
			<form
				className="flex flex-col gap-4 w-full"
				onSubmit={handleSubmit(onSubmit)}
			>
				<h1 className="font-semibold text-3xl max-lg:text-center max-lg:text-2xl">
					Iniciar Sessão
				</h1>
				<div className="flex flex-col gap-1 w-full">
					<label className="flex flex-col gap-2 w-full">
						Identificador Anônimo
						<input
							placeholder="Ex: anonimo_dds"
							{...register("username", {
								required: "O identificador é obrigatório",
							})}
							type="text"
							name="username"
							className="w-full bg-white rounded-md px-4 py-2 outline-none"
						/>
					</label>
					{errors.username && (
						<p className="text-red-500 text-sm">{errors.username.message}</p>
					)}
				</div>

				<div className="flex flex-col gap-1 w-full">
					<label className="flex flex-col gap-2 w-full">
						Palavra-passe
						<input
							{...register("password", {
								required: "A palavra-passe é obrigatória",
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
				</div>

				<div className="flex flex-col w-full">
					<button
						disabled={loading}
						type="submit"
						className="btn-primary"
					>
						{loading ? (
							<div className="w-7 h-7 rounded-full border-t-2 border border-l-2 border-white animate-spin"></div>
						) : (
							"Entrar"
						)}
					</button>
					<Link
						href="/register"
						className="text-center text-primary mt-2 hover:underline"
					>
						Não tem uma conta?{" "}
						<span className="font-semibold hover:text-[#333333] transition-colors duration-300">
							Criar Perfil
						</span>
					</Link>
				</div>
			</form>

			{/* <div className="flex items-center gap-4 text-gray-500 w-full my-4">
				<hr className="w-full" />
				ou
				<hr className="w-full" />
			</div>

			<button
				disabled={loading}
				type="submit"
				className="btn-secondary"
			>
				Entrar como anônimo visitante
			</button> */}
		</div>
	)
}
