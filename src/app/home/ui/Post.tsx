/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { PostInterface } from "@/app/interfaces/post"
import {
	EllipsisVertical,
	Forward,
	MessageCircle,
	Send,
	ThumbsUp,
} from "lucide-react"
import Image from "next/image"
import TimeAgo from "react-timeago"
import Comment from "../components/Comment"
import { customFormatter } from "@/app/utils/customFormatter"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { useState } from "react"
import { api } from "@/app/api/config"
import { useRouter } from "next/navigation"

interface CommentInput {
	text: string
}

export default function Post({ post }: { post: PostInterface }) {
	const { register, handleSubmit, reset, setFocus } = useForm<CommentInput>()

	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const [comments, setComments] = useState(post.comments || [])
	const [showAll, setShowAll] = useState(false)

	const displayedComments = showAll ? comments : comments.slice(0, 5)

	const onSubmit: SubmitHandler<CommentInput> = async (data) => {
		try {
			setLoading(true)
			const response = await api.post(`/comments/${post.id}`, data)

			if (response.status === 201) {
				const newComment = response.data.comment
				setComments((prev) => [newComment, ...prev])
				toast.success(response.data.message)
				router.refresh()

				reset()
			}
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.error ||
				"Erro ao fazer comentário. Por favor, tente novamente."
			toast.error(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="w-full bg-white p-6 rounded-3xl flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4 max-lg:gap-3">
					{post.profile_picture && (
						<Image
							src={post.profile_picture}
							width={50}
							height={50}
							unoptimized
							alt="Profile Picture"
							className="rounded-full bg-gray-300 max-lg:w-12"
						/>
					)}

					<span className="flex flex-col max-lg:text-sm">
						<p className="max-lg: text-lg font-semibold">{post.anon_name}</p>
						<p className="text-sm text-[#757575]">
							<TimeAgo date={post.created_at} formatter={customFormatter} />
						</p>
					</span>
				</div>

				<button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
					<EllipsisVertical className="text-[#757575]" />
				</button>
			</div>

			<p
				className={`max-lg:text-base ${
					post.text.length < 100
						? "text-3xl max-lg:text-xl"
						: "text-lg max-lg:text-base"
				}`}
			>
				{post.text}
			</p>

			<div className="flex flex-col gap-2">
				<hr className="border border-gray-200" />

				<ul className="flex items-center justify-between gap-4 font-semibold">
					<li className="w-full">
						<button className="w-full flex justify-center items-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-300 gap-2 cursor-pointer">
							<ThumbsUp className="w-5" />{" "}
							<span className="max-lg:text-sm max-lg:hidden">Gosto</span>
						</button>
					</li>
					<li className="w-full">
						<button
							onClick={() => setFocus("text")}
							type="submit"
							className="flex w-full justify-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-300 items-center gap-2 cursor-pointer"
						>
							<MessageCircle className="w-5" />
							<span className="max-lg:text-sm max-lg:hidden">Comentar</span>
						</button>
					</li>
					<li className="w-full">
						<button className="flex hover:bg-gray-100 w-full justify-center items-center p-2 rounded-md transition-colors duration-300 gap-2 cursor-pointer">
							<Forward className="w-5" />
							<span className="max-lg:text-sm max-lg:hidden">Partilhar</span>
						</button>
					</li>
				</ul>

				<hr className="border border-gray-200" />
			</div>

			<div className="flex flex-col gap-4">
				{displayedComments.length > 0 ? (
					displayedComments.map((comment) => (
						<Comment key={comment.id} comment={comment} />
					))
				) : (
					<p className="text-sm text-center text-gray-400">
						Nenhum comentário encontrado.
					</p>
				)}

				{!showAll && displayedComments.length > 5 && (
					<button
						className="text-sm text-center text-gray-500 cursor-pointer"
						onClick={() => setShowAll(true)}
					>
						Ver todos comentários
					</button>
				)}
			</div>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex items-center bg-gray-50"
			>
				<input
					{...register("text", { required: true })}
					className={`outline-none w-full px-4 py-2 resize-none`}
					type="text"
					placeholder="Adicionar um comentário..."
				/>
				<button
					type="submit"
					className="px-4 py-2 hover:bg-gray-200 rounded-md cursor-pointer flex  gap-2"
				>
					{loading ? (
						<div className="w-7 h-7 rounded-full border-t-2 border border-l-2 border-gray-500 animate-spin"></div>
					) : (
						"Enviar"
					)}
					<Send className="hidden" />
				</button>
			</form>
		</div>
	)
}
