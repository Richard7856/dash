import ChoferesForm from '@/components/form/ChoferesForm'

export default function ChoferesPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Taimingo</h1>
          <p className="text-gray-600">Solicita choferes para tu proyecto.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <ChoferesForm />
        </div>
      </div>
    </main>
  )
}
