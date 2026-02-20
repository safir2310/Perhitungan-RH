// Calculate RH date based on expiration date and days before
export function calculateRHDate(expirationDate: Date, rhDaysBefore: number = 14): Date {
  const rhDate = new Date(expirationDate);
  rhDate.setDate(rhDate.getDate() - rhDaysBefore);
  return rhDate;
}

// Calculate product status based on dates
export type ProductStatus = 'safe' | 'warning' | 'expired';

export function calculateProductStatus(rhDate: Date, expirationDate: Date): ProductStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rhDateNormalized = new Date(rhDate);
  rhDateNormalized.setHours(0, 0, 0, 0);

  const expirationDateNormalized = new Date(expirationDate);
  expirationDateNormalized.setHours(0, 0, 0, 0);

  // Check if expired
  if (today >= expirationDateNormalized) {
    return 'expired';
  }

  // Check if warning (wajib retur)
  if (today >= rhDateNormalized) {
    return 'warning';
  }

  // Safe
  return 'safe';
}

// Get days until RH date
export function getDaysUntilRH(rhDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rhDateNormalized = new Date(rhDate);
  rhDateNormalized.setHours(0, 0, 0, 0);

  const diffTime = rhDateNormalized.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get days until expiration
export function getDaysUntilExpiration(expirationDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expirationDateNormalized = new Date(expirationDate);
  expirationDateNormalized.setHours(0, 0, 0, 0);

  const diffTime = expirationDateNormalized.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Format date for display
export function formatDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// Get status label and color
export function getStatusInfo(status: ProductStatus): { label: string; color: string; bgClass: string; textClass: string } {
  switch (status) {
    case 'safe':
      return {
        label: 'AMAN',
        color: 'green',
        bgClass: 'bg-green-100 dark:bg-green-900/20',
        textClass: 'text-green-700 dark:text-green-400',
      };
    case 'warning':
      return {
        label: 'WAJIB RETUR',
        color: 'yellow',
        bgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
        textClass: 'text-yellow-700 dark:text-yellow-400',
      };
    case 'expired':
      return {
        label: 'JATUH RH',
        color: 'red',
        bgClass: 'bg-red-100 dark:bg-red-900/20',
        textClass: 'text-red-700 dark:text-red-400',
      };
    default:
      return {
        label: 'TIDAK DIKETAHUI',
        color: 'gray',
        bgClass: 'bg-gray-100 dark:bg-gray-900/20',
        textClass: 'text-gray-700 dark:text-gray-400',
      };
  }
}
