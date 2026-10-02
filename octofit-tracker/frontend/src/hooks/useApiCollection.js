import { useEffect, useState } from 'react'

const codespaceName = import.meta.env.VITE_CODESPACE_NAME?.trim()
const apiBaseUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev/api`
  : null

function getCollection(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    for (const key of ['results', 'items', 'data', 'records', 'content']) {
      if (key in payload) {
        return getCollection(payload[key])
      }
    }
  }

  throw new Error('The API response did not contain a list of records.')
}

async function fetchCollection(resource, signal) {
  if (!apiBaseUrl) {
    throw new Error(
      'Set VITE_CODESPACE_NAME in octofit-tracker/frontend/.env.local to connect to the API.',
    )
  }

  const response = await fetch(`${apiBaseUrl}/${resource}/`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    const responseText = await response.text()
    let message = responseText

    try {
      const body = JSON.parse(responseText)
      message = body.message || body.error || responseText
    } catch {
      // Keep the server's plain-text error when its response is not JSON.
    }

    throw new Error(
      message || `The API request failed with status ${response.status}.`,
    )
  }

  return getCollection(await response.json())
}

export default function useApiCollection(resource) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadRecords() {
      setLoading(true)
      setError('')

      try {
        setRecords(await fetchCollection(resource, controller.signal))
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : String(requestError || 'Unable to load records.'),
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadRecords()
    return () => controller.abort()
  }, [resource])

  return { records, loading, error }
}
