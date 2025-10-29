"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectFade } from "swiper/modules"
import "swiper/css"
import "swiper/css/effect-fade"
import Image from "next/image"

const slides = [
	{ src: "/auth/slide1.jpg", alt: "Slide 1" },
	{ src: "/auth/slide2.jpg", alt: "Slide 2" },
	{ src: "/auth/slide3.jpg", alt: "Slide 3" },
	{ src: "/auth/slide4.jpg", alt: "Slide 4" },
]

export default function AuthLeftSlider() {
	return (
		<Swiper
			modules={[Autoplay, EffectFade]}
			autoplay={{ delay: 3000 }}
			effect="fade"
			loop
			className="w-full h-full"
		>
			{slides.map((slide, index) => (
				<SwiperSlide
					key={index}
					className="flex items-center justify-center bg-[#D5D5D5]"
				>
					<Image
						src={slide.src}
						alt={slide.alt}
						width={400}
						height={300}
						unoptimized
						className="object-cover w-full h-full"
					/>
				</SwiperSlide>
			))}
		</Swiper>
	)
}
