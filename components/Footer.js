const Footer = () => {
  return (
    <footer className="bg-brand-blue-dark text-white py-8">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} IGEPPS Academy. Todos os direitos reservados.</p>
        <div className="flex justify-center space-x-4 mt-4">
          <a href="#" className="hover:underline">Política de Privacidade</a>
          <a href="#" className="hover:underline">Termos de Uso</a>
          <a href="#" className="hover:underline">Contato</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
