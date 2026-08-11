import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminHeader from "@/components/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import AdminUsuarios from "@/components/AdminUsuarios";
import { safeGetItem } from '@/lib/storage';

export default function UsuariosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const usu = safeGetItem("usuario");
    if (!usu) { router.push("/login"); return; }
    const u = JSON.parse(usu);
    if (u.tipo !== "admin") { router.push("/dashboard"); return; }
    setUsuario(u);
  }, []);

  if (!usuario) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1 min-w-0">
        <AdminHeader usuario={usuario} isCollapsed={isCollapsed} />
        <main className="p-8 pt-20">
          <AdminUsuarios />
        </main>
      </div>
    </div>
  );
}
