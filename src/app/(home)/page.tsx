"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Post from "./ui/Post";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <>
      <div className="w-full flex-col flex items-center gap-2 py-8">
        <h1 className="text-4xl font-bold">Bem-vindo ao Anônimo Angola</h1>
        <p className="text-lg text-gray-700">
          Esta é a sua plataforma para partilhar e descobrir histórias anônimas.
        </p>
      </div>

      <div className="w-full bg-white p-6 rounded-3xl flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center gap-4">
          <Image
            src={"/"}
            width={44}
            height={44}
            alt=""
            className="rounded-full bg-gray-500"
          />
          <span className="text-lg font-semibold">Usuário Anônimo</span>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-xl text-gray-500 w-fit cursor-text">
          Esteja à vontade para desabafar aqui...
        </button>
      </div>

      <h1 className="text-lg font-bold text-left w-full">ÚLTIMOS DESABAFOS</h1>

      {Array.from({ length: 5 }).map((_, index) => (
        <Post key={index} />
      ))}

      {menuOpen && (
        <div className="fixed h-screen w-full top-0 flex justify-center items-center bg-white/80 p-4 z-50">
          <div className="w-full bg-white p-6 rounded-3xl flex flex-col gap-4 shadow-lg transition-shadow duration-300 max-w-2xl">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-4">
                <Image
                  src={"/"}
                  width={44}
                  height={44}
                  alt=""
                  className="rounded-full bg-gray-500"
                />
                <p className="text-lg font-semibold">Usuário Anônimo</p>
              </span>

              <button
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300 cursor-pointer"
                onClick={() => setMenuOpen(false)}>
                <X className="text-gray-500" />
              </button>
            </div>

            <textarea
              rows={10}
              className="text-xl text-gray-500 w-full cursor-text resize-none bg-transparent outline-none"
              placeholder="Esteja à vontade para desabafar aqui..."></textarea>

            <button className="bg-[#1E1E1E] text-lg font-semibold text-white px-4 py-2 rounded-md hover:bg-[#333333] transition-colors duration-300 cursor-pointer w-full">
              Postar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
