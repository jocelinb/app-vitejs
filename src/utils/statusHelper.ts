import { StatusConfig } from '@/types';

const staticConfig: Record<string, StatusConfig> = {
  ready_to_pay: { label: 'Prêt à être payé',  bg: 'bg-green-100', text: 'text-green-800' },
  paid:          { label: 'Payé',              bg: 'bg-green-100',  text: 'text-green-800' },
  confirmed:     { label: 'Confirmé',          bg: 'bg-green-200',  text: 'text-green-900' },
  shipped:       { label: 'Expédié',           bg: 'bg-purple-100', text: 'text-purple-800'},
  delivered:     { label: 'Livré',             bg: 'bg-teal-100',   text: 'text-teal-800'  },
  cancelled:     { label: 'Annulé',            bg: 'bg-red-100',    text: 'text-red-800'   },
}

/**
 * Renvoie la config (label + classes) pour un statut donné.
 * Si on est en collecte ('pending' ou 'collecting'),
 * on calcule dynamiquement le solde à atteindre.
 */
export function getStatusConfig(
  status: string,
  totalAmount: number,
  freeShippingMin: number
): StatusConfig {
  // Phase de collecte
  if (status === 'pending' || status === 'collecting') {
    const remaining = freeShippingMin - totalAmount
    if (remaining > 0) {
      return {
        label: `Plus que ${remaining.toFixed(2)} € pour livraison gratuite`,
        bg: 'bg-yellow-100',
        text: 'text-yellow-800'
      }
    }
    // Dès que le seuil est atteint, on bascule en ready_to_pay
    return staticConfig['ready_to_pay']
  }

  // Les autres statuts fixes
  return staticConfig[status] || { label: status, bg: '', text: '' }
}
