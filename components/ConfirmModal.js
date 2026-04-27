export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'confirm' }) {
  if (!isOpen) return null;

  const isDelete = type === 'delete';
  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        {/* Header com Logo */}
        <div className={`p-6 ${isDelete ? 'bg-gradient-to-r from-red-500 to-red-600' : isSuccess ? 'bg-gradient-to-r from-green-500 to-green-600' : isError ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}>
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center" style={{ width: '300px', height: '80px' }}>
              <img src="/images/igepps-logo.png" alt="IGEPPS" className="w-full h-full object-contain" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white text-center">
            {title || 'IGEPPS Academy'}
          </h3>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <p className="text-gray-700 text-center mb-6 leading-relaxed">
            {message}
          </p>

          {/* Botões */}
          <div className="flex gap-3">
            {type === 'alert' || type === 'success' || type === 'error' || !onConfirm ? (
              <button
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                OK
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    console.log('>>> BOTÃO CONFIRMAR CLICADO <<<', typeof onConfirm);
                    if (onConfirm) {
                      console.log('>>> CHAMANDO onConfirm <<<');
                      onConfirm();
                    } else {
                      console.log('>>> onConfirm é null ou undefined <<<');
                    }
                  }}
                  className={`flex-1 font-semibold py-3 rounded-lg transition-all duration-200 ${
                    isDelete 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg' 
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 hover:shadow-lg'
                  }`}
                >
                  Confirmar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
