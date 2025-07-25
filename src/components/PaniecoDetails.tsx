import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { useWidgetContext } from '@/context/WidgetContext'
import { CartItem } from '@/types'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  publicId: string
  cart: CartItem[]
  freeShippingMin: number
  onUpdate?: () => void
}

export default function PaniecoDetails({ publicId, cart, freeShippingMin, onUpdate }: Props) {
  const { apiBaseUrl, externalClientId, apiKey, merchantUrl } = useWidgetContext()
  const [loading, setLoading] = useState(true)
  const [groupOrder, setGroupOrder] = useState<{
    public_id: string
    total_amount: string | number
  } | null>(null)
  const [participantId, setParticipantId] = useState<number | null>(null)
  const [hasPaid, setHasPaid] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async () => {
    try {
      const [detailsRes, infoRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/api/v1/group-orders/public/${publicId}`, {
          headers: { 'x-api-key': apiKey }
        }),
        axios.get(`${apiBaseUrl}/api/v1/group-orders/${publicId}/participant-info`, {
          headers: {
            'x-api-key': apiKey,
            'x-external-client-id': externalClientId
          }
        })
      ])

      setGroupOrder(detailsRes.data)
      setParticipantId(infoRes.data.participant_id)
      setHasPaid(!!infoRes.data.paid_at)
    } catch (err) {
      console.error('Erreur chargement PaniecoDetails:', err)
    } finally {
      setLoading(false)
    }
  }, [publicId, apiBaseUrl, apiKey, externalClientId])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const handleJoin = async () => {
    if (!cart.length) {
      setError('Votre panier est vide.')
      return
    }
    setProcessing(true)
    setError(null)
    const amount = cart.reduce((sum, it) => sum + it.quantity * it.unit_price, 0)
    try {
      await axios.post(
        `${apiBaseUrl}/api/v1/group-orders/${publicId}/participants-with-items`,
        {
          external_client_id: externalClientId,
          amount,
          items: cart
        },
        { headers: { 'x-api-key': apiKey } }
      )
      await fetchDetails()
      onUpdate?.()
    } catch (err) {
      console.error('Erreur en rejoignant le Panieco:', err)
      setError('Impossible de rejoindre le Panieco.')
    } finally {
      setProcessing(false)
    }
  }

  const handleLeave = async () => {
    if (!participantId) return
    setProcessing(true)
    setError(null)
    try {
      await axios.delete(
        `${apiBaseUrl}/api/v1/group-orders/${publicId}/participants/${participantId}`,
        { headers: { 'x-api-key': apiKey } }
      )
      await fetchDetails()
      onUpdate?.()
    } catch (err) {
      console.error('Erreur en quittant le Panieco:', err)
      setError("Impossible de quitter le Panieco.")
    } finally {
      setProcessing(false)
    }
  }

  const handlePay = async () => {
    setProcessing(true)
    setError(null)
    try {
      const res = await axios.post(
        `${merchantUrl}/panieco/checkout-session`,
        { externalClientId, groupOrderId: publicId, items: cart },
        { headers: { 'x-api-key': apiKey } }
      )
      if (res.data.url) {
        window.location.href = res.data.url
      } else {
        throw new Error('URL de paiement manquante.')
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setError('Vous avez déjà payé votre part sur ce Panieco.')
        } else {
          console.error('Erreur création session de paiement:', err)
          setError(err.response?.data?.error || 'Impossible de démarrer le paiement.')
        }
      } else {
        console.error(err)
        setError('Une erreur inconnue est survenue.')
      }
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <p className="text-sm text-gray-500 mt-2">Chargement…</p>
  if (!groupOrder) return <p className="text-sm text-red-500 mt-2">Erreur de chargement</p>

  const totalAmountNum =
    typeof groupOrder.total_amount === 'string'
      ? parseFloat(groupOrder.total_amount)
      : groupOrder.total_amount ?? 0

  const progress = Math.min((totalAmountNum / freeShippingMin) * 100, 100)

  return (
    <div className="border border-gray-200 rounded p-4 mt-2 bg-gray-50 text-sm space-y-3">
      <p className="text-gray-600">
        Panieco ID : <span className="font-mono">{groupOrder.public_id}</span>
      </p>

      <p className="font-medium text-gray-700">
        Total : {totalAmountNum.toFixed(2)} € / {freeShippingMin.toFixed(2)} €
      </p>

      <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {participantId ? (
        <>
          {hasPaid ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="text-green-600" size={18} />
              <span className="font-medium">Votre part a été payée</span>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2 text-gray-700">
                <CheckCircle className="text-gray-700" size={18} />
                <span className="font-medium">Vous êtes sur ce Panieco</span>
              </div>

              <button
                onClick={handleLeave}
                disabled={processing}
                className="btn-text flex items-center space-x-2 text-red-600 hover:underline mt-1"
              >
                <XCircle className="text-red-600" size={18} />
                <span>{processing ? 'Traitement…' : 'Me retirer du Panieco'}</span>
              </button>

              <button
                onClick={handlePay}
                disabled={processing}
                className="btn-primary w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 mt-2"
              >
                {processing ? 'Chargement…' : 'Payer ma part'}
              </button>
            </>
          )}
        </>
      ) : (
        <button
          onClick={handleJoin}
          disabled={processing}
          className="btn-primary w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {processing ? 'Rejoindre…' : 'Rejoindre'}
        </button>
      )}

      <div className="mt-3">
        <p className="font-medium text-gray-700">Votre commande :</p>
        <ul className="list-disc list-inside text-gray-600 ml-4 mt-1">
          {cart.map((item, i) => (
            <li key={i}>
              {item.quantity} × {item.name} ({item.unit_price.toFixed(2)} €)
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
