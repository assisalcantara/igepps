import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminHeader from "@/components/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import AdminUsuarios from "@/components/AdminUsuarios";
import { safeGetItem } from '@/lib/storage';

export default function UsuariosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usu = safeGetItem("usuario");
    if (!usu) { router.push("/login"); return; }
    const u = JSON.parse(usu);
    if (u.tipo !== "admin") { router.push("/dashboard"); return; }
    setUsuario(u);
  }, []);

  if (!usuario) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50">
      <AdminHeader usuario={usuario} />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <AdminUsuarios />
        </main>
      </div>
    </div>
  );
}
