'use client'

import { useState, useEffect, useRef } from 'react'
import { EvidenciaPago } from '@/lib/types'

interface Props {
  solicitudId: string
  onClose: () => void
}

export default function EvidenciaModal({ solicitudId, onClose }: Props) {
  const [evidencias, setEvidencias] = useState<EvidenciaPago[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchEvidencias = async () => {
    const res = await fetch(`/api/evidencias/${solicitudId}`)
    if (res.ok) {
      const data = await res.json()
      setEvidencias(data.data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchEvidencias() }, [solicitudId])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('solicitud_id', solicitudId)

    try {
      const res = await fetch('/api/evidencias', { method: 'POST', body: formData })
      if (res.ok) {
        await fetchEvidencias()
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Evidencia de pago</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" id="evidence-upload" />
            <label
              htmlFor="evidence-upload"
              className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploading ? 'border-gray-200 bg-gray-50' : 'border-teal-300 hover:border-teal-400 hover:bg-teal-50'}`}
            >
              {uploading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500" /> <span className="text-sm text-gray-500">Subiendo...</span></>
              ) : (
                <><svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> <span className="text-sm text-teal-600 font-medium">Subir imagen</span></>
              )}
            </label>
          </div>

          {loading ? (
            <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" /></div>
          ) : evidencias.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm">Sin evidencias</p>
          ) : (
            <div className="space-y-3">
              {evidencias.map(ev => (
                <div key={ev.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <img src={ev.url} alt={ev.filename} className="w-full h-48 object-cover" />
                  <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-500 truncate">{ev.filename}</span>
                    <span className="text-xs text-gray-400">{new Date(ev.created_at).toLocaleDateString('es-MX')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
