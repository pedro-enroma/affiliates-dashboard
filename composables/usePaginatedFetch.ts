const PAGE_SIZE = 1000

/**
 * Fetches all rows from a Supabase query by paginating through results.
 * Supabase limits responses to 1000 rows by default — this fetches all pages.
 */
export async function fetchAllRows<T>(
  buildQuery: (from: number, to: number) => any,
): Promise<T[]> {
  const allRows: T[] = []
  let offset = 0

  while (true) {
    const { data, error } = await buildQuery(offset, offset + PAGE_SIZE - 1)
    if (error) throw error

    const rows = (data || []) as T[]
    allRows.push(...rows)

    if (rows.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return allRows
}
