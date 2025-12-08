import { useCallback, useEffect, useMemo, useState } from 'react'
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

interface ParticipantItem {
  name: string;
  reference?: string;
  quantity: number;
  unit_price: number | string;
}

export default function PaniecoDetails({ publicId, cart, freeShippingMin, onUpdate }: Props) {
  const { apiBaseUrl, externalClientId, apiKey, merchantUrl } = useWidgetContext()

  const [loading, setLoading] = useState(true)
  const [groupOrder, setGroupOrder] = useState<{
    public_id: string;
    total_amount: string | number;
    participant_count: number;
    status: string;
  } | null>(null)

  const [participantId, setParticipantId] = useState<number | null>(null)
  const [hasPaid, setHasPaid] = useState(false)
  const [hasAuthorized, setHasAuthorized] = useState(false)

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // pour “Modifier ma commande”
  const [initialItems, setInitialItems] = useState<CartItem[]>([])
  const [initialAmount, setInitialAmount] = useState<number>(0)
  const [orderUpdated, setOrderUpdated] = useState(false)

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
      setHasAuthorized(!!infoRes.data.authorized_at)

      if (infoRes.data.items) {
        const items = infoRes.data.items as ParticipantItem[];

        const mapped: CartItem[] = items.map((it) => {
          const price =
            typeof it.unit_price === 'string'
              ? parseFloat(it.unit_price)
              : it.unit_price;

          return {
            id: it.name,
            name: it.name,
            quantity: it.quantity,
            unit_price: price
          };
        });

        setInitialItems(mapped);
        setInitialAmount(parseFloat(infoRes.data.amount ?? '0'));
      }
    } catch (err) {
      console.error('Erreur chargement PaniecoDetails:', err)
    } finally {
      setLoading(false)
    }
  }, [publicId, apiBaseUrl, apiKey, externalClientId])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  // Auto-refresh tant qu’on attend une transition (autorisé en attente, non confirmé/expédié)
  useEffect(() => {
    const shouldPoll =
      !!groupOrder &&
      groupOrder.status !== 'confirmed' &&
      groupOrder.status !== 'shipped' &&
      (!hasPaid || hasAuthorized);

    if (!shouldPoll) return;

    const id = setInterval(() => {
      fetchDetails();
    }, 7000);

    return () => clearInterval(id);
  }, [groupOrder, hasPaid, hasAuthorized, fetchDetails]);

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
          setError('Votre paiement est déjà autorisé (ou réglé) pour ce Panieco.')
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

  const handleModifyOrder = async () => {
    if (!participantId) return;
    if (!cart.length) {
      setError('Votre panier est vide.');
      return;
    }
    setProcessing(true);
    setError(null);

    const amount = cart.reduce(
      (sum, it) => sum + it.quantity * it.unit_price,
      0
    );

    try {
      await axios.put(
        `${apiBaseUrl}/api/v1/group-orders/${publicId}/participants/${participantId}/order`,
        {
          amount,
          items: cart
        },
        { headers: { 'x-api-key': apiKey } }
      );
      await fetchDetails();
      onUpdate?.();

      setOrderUpdated(true);
      setTimeout(() => setOrderUpdated(false), 4000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la commande :', err);
      setError('Impossible de modifier la commande.');
    } finally {
      setProcessing(false);
    }
  };

  const hasChanges = useMemo(() => {
    if (!participantId) return false;

    const currentAmount = cart.reduce(
      (sum, it) => sum + it.quantity * it.unit_price,
      0
    );

    if (Math.abs(currentAmount - initialAmount) > 1e-2) return true;

    if (cart.length !== initialItems.length) return true;

    return cart.some((item) => {
      const match = initialItems.find(
        (oldItem) =>
          oldItem.name === item.name &&
          Math.abs(oldItem.unit_price - item.unit_price) < 1e-2
      );
      return !match || match.quantity !== item.quantity;
    });
  }, [participantId, cart, initialItems, initialAmount]);

  if (loading) return <p className="text-sm text-gray-500 mt-2">Chargement…</p>
  if (!groupOrder) return <p className="text-sm text-red-500 mt-2">Erreur de chargement</p>

  const totalAmountNum =
    typeof groupOrder.total_amount === 'string'
      ? parseFloat(groupOrder.total_amount)
      : groupOrder.total_amount ?? 0

  const isConfirmed = groupOrder.status === 'confirmed';
  const isShipped = groupOrder.status === 'shipped';
  const isReadyToPay = groupOrder.status === 'ready_to_pay';

  // Le bouton ne s’affiche que si prêt + pas payé + pas déjà autorisé
  const canPay = isReadyToPay && !hasPaid && !hasAuthorized;

  const progress = Math.min((totalAmountNum / freeShippingMin) * 100, 100)

  return (
    <div className="border border-gray-200 rounded p-4 mt-2 bg-gray-50 text-sm space-y-3">
      <p className="text-gray-600">
        Panieco ID : <span className="font-mono">{groupOrder.public_id}</span>
      </p>

      <p className="text-gray-600">
        Participants : <span className="font-mono">{groupOrder.participant_count}</span>
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

      {/* ---- BLOC STATUT ---- */}
      {(isConfirmed || isShipped) ? (
        <div className="border border-gray-200 rounded p-4 bg-gray-50 text-center text-green-700 font-semibold my-2">
          {isConfirmed && "Commande complète : en préparation !"}
          {isShipped && "Commande expédiée !"}
        </div>
      ) : participantId ? (
        <>
          {hasPaid ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="text-green-600" size={18} />
              <span className="font-medium">Votre part a été payée</span>
            </div>
          ) : hasAuthorized ? (
            <div className="flex items-center space-x-2 text-emerald-600">
              <CheckCircle className="text-emerald-600" size={18} />
              <span className="font-medium">
                Paiement autorisé – vous serez débité dès que la commande partira.
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2 text-gray-700">
                <CheckCircle className="text-gray-700" size={18} />
                <span className="font-medium">Vous êtes sur ce Panieco</span>
              </div>

              {/* Me retirer / Modifier uniquement tant que NON autorisé et NON payé */}
              {!hasPaid && !hasAuthorized && (
                <button
                  onClick={handleLeave}
                  disabled={processing}
                  className="btn-text flex items-center space-x-2 text-red-600 hover:underline mt-1"
                >
                  <XCircle className="text-red-600" size={18} />
                  <span>{processing ? 'Traitement…' : 'Me retirer du Panieco'}</span>
                </button>
              )}

              {!hasPaid && !hasAuthorized && (
                orderUpdated ? (
                  <p className="mt-2 text-green-600">
                    La modification de votre commande a bien été prise en compte dans ce Panieco.
                  </p>
                ) : (
                  hasChanges && (
                    <button
                      onClick={handleModifyOrder}
                      disabled={processing}
                      className="btn-secondary w-full py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition disabled:opacity-50 mt-2"
                    >
                      {processing ? 'Modification…' : 'Modifier ma commande'}
                    </button>
                  )
                )
              )}

              {/* Paiement : bouton actif seulement quand prêt ET non autorisé/non payé */}
              {canPay ? (
                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="btn-primary w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 mt-2"
                >
                  {processing ? 'Chargement…' : 'Payer ma part'}
                </button>
              ) : !hasAuthorized && !hasPaid && (
                <>
                  <button
                    disabled
                    className="btn-primary w-full py-2 bg-gray-400 text-white rounded cursor-not-allowed mt-2"
                    style={{ opacity: 0.7 }}
                  >
                    Payer ma part
                  </button>
                  <p className="text-gray-500 text-sm mt-1 text-center">
                    Vous pourrez passer au paiement une fois le seuil atteint.
                  </p>
                </>
              )}
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
