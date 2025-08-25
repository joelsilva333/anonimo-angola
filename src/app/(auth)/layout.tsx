import Image from "next/image";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      <div className="flex-1 flex items-center justify-center bg-[#D5D5D5] max-lg:hidden">
        <Image
          src="/logos/bg-none.png"
          alt="Logo"
          width={500}
          height={165}
        />
      </div>
      <div className="flex-1 flex items-center justify-center max-lg:flex-col">
        <Image
          src="/logos/bg-none.png"
          alt="Logo"
          width={500}
          height={165}
          className="max-lg:w-52 lg:hidden"
        />
        {children}
      </div>
    </div>
  );
}
