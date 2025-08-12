import Image from "next/image";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      <div className="flex-1 flex items-center justify-center bg-[#D5D5D5]">
        <Image
          src="/logos/bg-none.png"
          alt="Logo"
          width={500}
          height={165}
        />
      </div>
      <div className="flex-1 flex items-center justify-center">{children}</div>
    </div>
  );
}
