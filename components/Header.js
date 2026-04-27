import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-brand-blue font-heading">
          <Link href="/">
            IGEPPS Academy
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li><Link href="/cursos" className="text-gray-700 hover:text-brand-orange font-sans">Cursos</Link></li>
            <li><Link href="/sobre" className="text-gray-700 hover:text-brand-orange font-sans">Sobre</Link></li>
            <li><Link href="/contato" className="text-gray-700 hover:text-brand-orange font-sans">Contato</Link></li>
          </ul>
        </nav>
        <div>
          <Link href="/login" className="bg-brand-orange text-white font-bold py-2 px-4 rounded hover:bg-brand-orange-dark transition duration-300">
            Área do Aluno
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
