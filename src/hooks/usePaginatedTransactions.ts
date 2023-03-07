import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [ paginated, setPaginated ]= useState(true)
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    const page = paginatedTransactions === null ? 0 : paginatedTransactions.nextPage

    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: page,
      }
    )

    setPaginatedTransactions((previousResponse) => {
      setPaginated(true)
      if (response === null || previousResponse === null) {
        return response
      }

      if (response.nextPage === null) {
        console.log('hit')
        setPaginated(false)
      }

      //concatenate new transactions to the existing transactions
      return { 
        data: previousResponse ? [...previousResponse.data, ...response.data] : response.data,
        nextPage: response.nextPage
       }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
    setPaginated(false)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData, paginated }
}
