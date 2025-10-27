import { PostCommentInterface } from "@/app/interfaces/comments"
import { customFormatter } from "@/app/utils/customFormatter"
import { EllipsisVertical, MessageCircle, ThumbsUp } from "lucide-react"
import Image from "next/image"
import TimeAgo from "react-timeago"
/* import TimeAgo from "react-timeago"; */

export default function Comment({
	comment,
}: {
	comment: PostCommentInterface
}) {
	return (
		<li className="w-full flex flex-col gap-2 bg-gray-50 p-4 rounded-md items-start hover:bg-gray-100 transition-colors duration-300">
			<div className="flex gap-2 max-lg:text-sm items-center justify-between w-full">
				<span className="flex gap-3 items-center">
					{comment.profile_picture && (
						<Image
							src={comment.profile_picture}
							width={300}
							height={300}
							unoptimized
							alt="Profile Picture"
							className="rounded-full bg-gray-300 w-8 h-8"
						/>
					)}

					<span className="flex gap-1 items-center">
						<p className="text-sm font-semibold">{comment.anon_name}</p>
						<span className="text-xs">•</span>
						<p className="max-lg:text-xs text-sm text-[#757575]">
							<TimeAgo date={comment.created_at} formatter={customFormatter} />
						</p>
					</span>
				</span>

				<button className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-300 cursor-pointer">
					<EllipsisVertical className="text-[#757575] w-5" />
				</button>
			</div>

			<p className="text-sm">{comment.text}</p>

			<div className="flex items-center w-full font-semibold text-sm">
				<button className=" flex justify-center items-center px-4 py-1 rounded-md hover:bg-gray-200 transition-colors duration-300 gap-2 cursor-pointer">
					<ThumbsUp className="w-4" />{" "}
					<span className="max-lg:text-sm max-lg:hidden">Gosto</span>
				</button>

				<button className=" flex justify-center items-center px-4 py-1 rounded-md hover:bg-gray-200 transition-colors duration-300 gap-2 cursor-pointer">
					<MessageCircle className="w-4" />
					<span className="max-lg:text-sm max-lg:hidden">Responder</span>
				</button>
			</div>
		</li>
	)
}
