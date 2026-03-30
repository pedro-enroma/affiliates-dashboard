export function useFormatDate() {
  /**
   * Format a date string as DD-MM-YYYY
   */
  function formatDate(dateStr: string): string {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  return { formatDate }
}
