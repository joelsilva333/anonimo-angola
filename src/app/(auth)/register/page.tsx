import Link from "next/link";

export default function Register() {
  return (
    <div className="w-full max-w-md p-8">
      <form className="flex flex-col gap-4 w-full ">
        <h1 className="font-semibold text-3xl">Criar Perfil</h1>
        <label className="flex flex-col gap-2 w-full">
          Identificador Anônimo
          <input
            placeholder="Ex: anonimo_dds"
            type="text"
            name="username"
            className="w-full bg-white rounded-md px-4 py-2 outline-none"
          />
        </label>

        <label className="flex flex-col gap-2 w-full">
          Palavra-passe
          <input
            type="password"
            name="password"
            placeholder="*********"
            className="w-full bg-white rounded-md px-4 py-2 outline-none"
          />
        </label>

        <label className="flex flex-col gap-2 w-full">
          Confirmar palavra-passe
          <input
            type="password"
            name="password"
            placeholder="*********"
            className="w-full bg-white rounded-md px-4 py-2 outline-none"
          />
        </label>

        <div className="flex flex-col w-full">
          <button
            type="submit"
            className="bg-[#1E1E1E] text-white px-4 py-2 rounded-md hover:bg-[#333333] transition-colors duration-300 cursor-pointer w-full">
            Criar
          </button>

          <Link
            href="/login"
            className="text-center text-[#1E1E1E] mt-2 hover:underline">
            Já tem uma conta?{" "}
            <span className="font-semibold hover:text-[#333333] transition-colors duration-300">
              Entrar
            </span>
          </Link>
        </div>
      </form>
    </div>
  );
}
